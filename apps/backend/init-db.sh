#!/bin/bash
set -e

# Check if the table 'apikeys' exists
TABLE_EXISTS=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='apikeys'")

# If the table does not exist, run the SQL script
if [ -z "$TABLE_EXISTS" ]; then
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/database.sql
fi
