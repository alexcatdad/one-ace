FROM oven/bun:1.3 as deps
WORKDIR /app

COPY bun.lock package.json tsconfig.json ./
COPY biome.json CONTRIBUTING.md README.md ./
COPY apps apps
COPY packages packages
COPY infra infra

RUN bun install --frozen-lockfile

FROM oven/bun:1.3 as runner
WORKDIR /app/apps/api-gateway

COPY --from=deps /app /app

ENV NODE_ENV=production
ENV API_GATEWAY_PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]

