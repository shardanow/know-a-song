#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
header(){ echo -e "\n${CYAN}━━━ $1 ━━━${NC}\n"; }

load_nvm() {
  if command -v nvm &>/dev/null; then
    nvm use 22 2>/dev/null || true
  elif [ -s "$HOME/.nvm/nvm.sh" ]; then
    . "$HOME/.nvm/nvm.sh" && nvm use 22 2>/dev/null || true
  fi
}

check_docker() {
  if ! docker info &>/dev/null; then
    error "Docker is not running. Start Docker first."
    exit 1
  fi
}

check_postgres() {
  if docker compose ps postgres 2>/dev/null | grep -q "Up"; then
    return 0
  fi
  return 1
}

wait_postgres() {
  echo "Waiting for PostgreSQL to be healthy..."
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U postgres &>/dev/null; then
      info "PostgreSQL is ready"
      return 0
    fi
    sleep 1
  done
  error "PostgreSQL did not become healthy"
  exit 1
}

cmd_setup() {
  header "FIRST TIME SETUP"
  load_nvm

  if [ ! -f apps/frontend/.env.local ]; then
    warn "apps/frontend/.env.local not found!"
    info "Creating from .env.example..."
    cp .env.example apps/frontend/.env.local 2>/dev/null || true
    echo ""
    echo "  Edit apps/frontend/.env.local and set:"
    echo "    NEXT_PUBLIC_TMDB_TOKEN=your-tmdb-bearer-token"
    echo ""
    read -rp "Press Enter to continue or Ctrl+C to abort..."
  fi

  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 3001/tcp 2>/dev/null || true

  info "Installing dependencies..."
  npm install
  check_docker
  info "Starting PostgreSQL..."
  docker compose up -d
  wait_postgres
  info "Running migrations..."
  npm run generate -w packages/database 2>/dev/null || true
  npm run push -w packages/database
  info "Setup complete! Starting dev servers..."
  npm run dev
}

cmd_dev() {
  header "DEVELOPMENT MODE"
  load_nvm
  check_docker

  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 3001/tcp 2>/dev/null || true

  if ! check_postgres; then
    info "Starting PostgreSQL..."
    docker compose up -d
    wait_postgres
  else
    info "PostgreSQL is already running"
  fi

  info "Running migrations..."
  npm run push -w packages/database 2>/dev/null || true
  info "Starting dev servers (backend:3000  frontend:3001)..."
  npm run dev
}

cmd_prod() {
  header "PRODUCTION MODE"
  check_docker
  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 3001/tcp 2>/dev/null || true
  info "Building and starting all services..."
  docker compose -f docker-compose.prod.yml up --build
}

cmd_build() {
  header "BUILD ALL"
  load_nvm
  info "Building backend..."
  npm run build -w apps/backend
  info "Building frontend..."
  npm run build -w apps/frontend
  info "All builds passed"
}

cmd_rebuild() {
  header "REBUILD DOCKER (NO CACHE)"
  check_docker
  info "Rebuilding all Docker images..."
  docker compose -f docker-compose.prod.yml build --no-cache
  info "Starting services..."
  docker compose -f docker-compose.prod.yml up
}

cmd_backup() {
  header "DATABASE BACKUP"
  check_docker
  if ! check_postgres; then
    error "PostgreSQL is not running. Start it first: ./manage.sh dev"
    return 1
  fi

  mkdir -p backups
  local filename="backups/db_$(date +%Y%m%d_%H%M%S).sql"
  info "Creating backup: $filename"
  docker compose exec -T postgres pg_dump -U postgres knowasong > "$filename"
  local size
  size=$(du -h "$filename" | cut -f1)
  info "Backup created: $filename ($size)"
}

cmd_restore() {
  header "DATABASE RESTORE"
  check_docker

  local backups=("$ROOT_DIR"/backups/*.sql)
  if [ ${#backups[@]} -eq 0 ]; then
    error "No backups found in backups/"
    return 1
  fi

  echo "Available backups:"
  for i in "${!backups[@]}"; do
    local name
    name=$(basename "${backups[$i]}")
    local size
    size=$(du -h "${backups[$i]}" | cut -f1)
    echo "  $((i+1))) $name ($size)"
  done
  echo ""
  read -rp "Select backup to restore (1-${#backups[@]}): " choice

  if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#backups[@]}" ]; then
    error "Invalid selection"
    return 1
  fi

  local selected="${backups[$((choice-1))]}"
  warn "WARNING: This will DESTROY the current database!"
  read -rp "Are you sure? Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    info "Restore cancelled"
    return 0
  fi

  if ! check_postgres; then
    info "Starting PostgreSQL..."
    docker compose up -d
    wait_postgres
  fi

  info "Dropping and recreating database..."
  docker compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS knowasong" 2>/dev/null || true
  docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE knowasong"

  info "Restoring from $(basename "$selected")..."
  cat "$selected" | docker compose exec -T postgres psql -U postgres knowasong
  info "Restore complete"
}

cmd_logs() {
  header "LOGS"

  local services=("postgres" "backend (Docker)" "backend (local)" "frontend (Docker)" "frontend (local)")
  echo "Select service:"
  for i in "${!services[@]}"; do
    echo "  $((i+1))) ${services[$i]}"
  done
  echo ""
  read -rp "Choice (1-${#services[@]}): " choice

  case "$choice" in
    1) check_docker; docker compose logs -f postgres ;;
    2) check_docker; docker compose -f docker-compose.prod.yml logs -f backend ;;
    3) load_nvm; npm run dev -w apps/backend 2>&1 | tail -f ;;
    4) check_docker; docker compose -f docker-compose.prod.yml logs -f frontend ;;
    5) load_nvm; npm run dev -w apps/frontend 2>&1 | tail -f ;;
    *) error "Invalid selection" ;;
  esac
}

cmd_stop() {
  header "STOP ALL"
  check_docker
  info "Stopping Docker containers..."
  docker compose down
  info "Stopped"
}

cmd_reset() {
  header "RESET DATABASE"
  check_docker

  warn "WARNING: This will DESTROY all data in the database!"
  read -rp "Are you sure? Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    info "Reset cancelled"
    return 0
  fi

  if ! check_postgres; then
    info "Starting PostgreSQL..."
    docker compose up -d
    wait_postgres
  fi

  info "Dropping all tables..."
  docker compose exec -T postgres psql -U postgres -d knowasong -c "
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
  "
  info "Running migrations..."
  load_nvm
  npm run generate -w packages/database 2>/dev/null || true
  npm run push -w packages/database
  info "Database reset complete"
}

cmd_lint() {
  header "LINT & TYPECHECK"
  load_nvm
  info "Running linter..."
  npm run lint 2>&1 || true
  info "Running typecheck..."
  npm run typecheck 2>&1 || true
  info "Done"
}

cmd_audit() {
  header "SECURITY AUDIT"
  load_nvm
  info "Running npm audit..."
  npm audit
  echo ""
  info "Audit complete"
}

cmd_seed() {
  header "SEED DATABASE"
  check_docker
  if ! check_postgres; then
    info "Starting PostgreSQL..."
    docker compose up -d
    wait_postgres
  fi
  info "Inserting seed data..."
  docker compose exec -T postgres psql -U postgres knowasong < scripts/seed.sql 2>/dev/null && info "Seed data inserted" || warn "Some seed data may already exist (OK)"
}

cmd_seed_clean() {
  header "CLEAN SEED DATA"
  check_docker
  if ! check_postgres; then
    error "PostgreSQL is not running. Start it first: ./manage.sh dev"
    return 1
  fi
  info "Removing seed data..."
  docker compose exec -T postgres psql -U postgres knowasong < scripts/seed-clean.sql 2>/dev/null && info "Seed data removed" || warn "No seed data to remove"
}

cmd_test() {
  header "RUN TESTS"
  load_nvm
  info "Running backend tests..."
  npm run test -w apps/backend 2>&1 || true
  echo ""
  info "Running frontend tests..."
  npm run test -w apps/frontend 2>&1 || true
  echo ""
  info "Tests complete"
}

cmd_make_admin() {
  header "MAKE ADMIN"
  check_docker
  if ! check_postgres; then
    error "PostgreSQL is not running. Start it first: ./manage.sh dev"
    return 1
  fi

  local username="${1:-}"
  if [ -z "$username" ]; then
    read -rp "Enter username to make admin: " username
  fi

  if [ -z "$username" ]; then
    error "Username is required"
    return 1
  fi

  docker compose exec -T postgres psql -U postgres knowasong -c "
    UPDATE \"Users\"
    SET user_type_id = (SELECT id FROM \"UserType\" WHERE title = 'Admin' LIMIT 1)
    WHERE username = '$username';
  " 2>&1 | grep -v "UPDATE"
  info "User '$username' is now admin"
}

cmd_status() {
  header "STATUS"
  load_nvm

  echo -e "${CYAN}Node:${NC}    $(node --version 2>/dev/null || echo 'N/A')"
  echo -e "${CYAN}NPM:${NC}     $(npm --version 2>/dev/null || echo 'N/A')"
  echo ""

  if docker info &>/dev/null; then
    echo -e "${CYAN}Docker:${NC}  Running"
    echo ""
    echo "Containers:"
    docker compose ps 2>/dev/null || echo "  (no compose project)"
    echo ""
  else
    echo -e "${YELLOW}Docker:${NC}  Not running"
  fi

  echo -e "${CYAN}Backups:${NC}"
  local count
  count=$(ls backups/*.sql 2>/dev/null | wc -l)
  echo "  $count backup(s) in backups/"
  ls -lh backups/*.sql 2>/dev/null | awk '{print "  " $NF " (" $5 ")"}' || true
}

show_menu() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║       Know A Song — Manage Tool      ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
  echo ""
  echo "  1)  setup     — First time setup (full)"
  echo "  2)  dev       — Start development mode"
  echo "  3)  prod      — Start production mode"
  echo "  4)  build     — Build all apps"
  echo "  5)  rebuild   — Rebuild Docker images"
  echo "  6)  backup    — Backup database"
  echo "  7)  restore   — Restore database"
  echo "  8)  logs      — View logs"
  echo "  9)  stop      — Stop all services"
  echo "  10) reset     — Reset database"
  echo "  11) lint      — Lint + typecheck"
  echo "  12) audit     — Security audit"
  echo "  13) status    — Show status"
  echo "  14) seed      — Fill database with test data"
  echo "  15) seed:clean — Remove test data"
  echo "  16) test      — Run all tests"
  echo "  17) make:admin — Make a user admin"
  echo "  0)  exit"
  echo ""
  read -rp "Select option [0-17]: " choice
  echo ""

  case "$choice" in
    1) cmd_setup ;;
    2) cmd_dev ;;
    3) cmd_prod ;;
    4) cmd_build ;;
    5) cmd_rebuild ;;
    6) cmd_backup ;;
    7) cmd_restore ;;
    8) cmd_logs ;;
    9) cmd_stop ;;
    10) cmd_reset ;;
    11) cmd_lint ;;
    12) cmd_audit ;;
    13) cmd_status ;;
    14) cmd_seed ;;
    15) cmd_seed_clean ;;
    16) cmd_test ;;
    17) cmd_make_admin ;;
    0) info "Goodbye!"; exit 0 ;;
    *) error "Invalid option: $choice";;
  esac
}

main() {
  if [ $# -gt 0 ]; then
    case "$1" in
      setup|dev|prod|build|rebuild|backup|restore|logs|stop|reset|lint|audit|status|seed|test)
        "cmd_$1"
        ;;
      seed:clean)
        cmd_seed_clean
        ;;
      make:admin)
        cmd_make_admin "$2"
        ;;
      help|--help|-h)
        echo "Usage: ./manage.sh [command]"
        echo ""
        echo "Commands:"
        echo "  setup      First time setup (nvm → npm i → docker → migrate → dev)"
        echo "  dev        Start development mode (postgres + migrate + backend + frontend)"
        echo "  prod       Start production mode (Docker Compose)"
        echo "  build      Build all apps (npm)"
        echo "  rebuild    Rebuild Docker images (no cache)"
        echo "  backup     Backup PostgreSQL database"
        echo "  restore    Restore PostgreSQL database"
        echo "  logs       View logs (interactive)"
        echo "  seed       Fill database with test data"
        echo "  seed:clean Remove test data"
        echo "  make:admin <user>  Make a user an admin"
        echo "  test       Run all tests"
        echo "  stop       Stop all Docker containers"
        echo "  reset      Reset database (drop + recreate + migrate)"
        echo "  lint       Run linter + typecheck"
        echo "  audit      Run security audit"
        echo "  status     Show project status"
        echo ""
        echo "Run without arguments for interactive menu."
        ;;
      *)
        error "Unknown command: $1"
        echo "Usage: ./manage.sh [command]"
        exit 1
        ;;
    esac
  else
    while true; do
      show_menu
    done
  fi
}

main "$@"
