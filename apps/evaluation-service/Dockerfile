FROM oven/bun:1.3 as deps
WORKDIR /app

COPY bun.lock package.json tsconfig.json ./
COPY biome.json CONTRIBUTING.md README.md ./
COPY apps apps
COPY packages packages
COPY infra infra

RUN bun install --frozen-lockfile

FROM oven/bun:1.3 as runner
WORKDIR /app/apps/evaluation-service

COPY --from=deps /app /app

ENV NODE_ENV=production
ENV EVALUATION_SERVICE_PORT=3300

EXPOSE 3300

CMD ["bun", "run", "src/index.ts"]

