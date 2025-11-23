# Multi-stage build for ACE Web UI
FROM oven/bun:1.3 as deps
WORKDIR /app
COPY bun.lock package.json tsconfig.json ./
COPY apps apps/
COPY packages packages/
RUN bun install --frozen-lockfile

FROM oven/bun:1.3 as builder
WORKDIR /app
COPY --from=deps /app /app
WORKDIR /app/apps/web-ui
RUN bun run build

FROM nginx:alpine as runner
COPY --from=builder /app/apps/web-ui/dist /usr/share/nginx/html
COPY apps/web-ui/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3500
CMD ["nginx", "-g", "daemon off;"]
