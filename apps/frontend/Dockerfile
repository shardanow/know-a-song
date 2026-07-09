FROM node:22-alpine AS build

ARG NEXT_PUBLIC_API_URL=http://backend:3000/api

WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/frontend/package.json apps/frontend/
RUN npm ci
COPY apps/frontend/ apps/frontend/
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build -w apps/frontend

FROM node:22-alpine AS run

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
COPY --from=build /app/apps/frontend/messages ./apps/frontend/messages

ENV PORT=3001
EXPOSE 3001
CMD ["node", "apps/frontend/server.js"]
