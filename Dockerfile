# ORACINE — Railway / Node Dockerfile
# Builds the TanStack Start app with the Nitro node-server preset so it runs
# on plain Node.js with full Node APIs (Cloudflare Workers is too limited
# for some of our scrapers and the HLS download remux).

FROM oven/bun:1.1.34 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

FROM oven/bun:1.1.34 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Force Nitro to emit a Node.js server instead of the default Cloudflare worker
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production
RUN bun run build

# Runtime stage — slim Node image (no bun needed at runtime)
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Nitro node-server emits .output with its own dependencies bundled
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
# Healthcheck — make sure the server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:${PORT}/ || exit 1

CMD ["node", ".output/server/index.mjs"]
