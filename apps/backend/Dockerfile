FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
COPY patches/ patches/

RUN npm ci

COPY apps/backend/ apps/backend/
COPY packages/shared/ packages/shared/
COPY packages/database/ packages/database/

RUN npx turbo build --filter=@know-a-song/backend

FROM node:22-alpine AS run

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/packages/database ./packages/database
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "apps/backend/dist/main"]
