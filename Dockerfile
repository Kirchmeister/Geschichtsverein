FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build:linux
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 ARCHIVE_HOSTING_RUNTIME=linux ARCHIVE_BUILD_TARGET=linux
COPY --from=build --chown=node:node /app/.next-linux/standalone ./
COPY --from=build --chown=node:node /app/.next-linux/static ./.next-linux/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/drizzle ./drizzle
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/version.json ./version.json
# CLI requires the same verified WebAuthn package as the application.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
RUN mkdir /data /config && chown node:node /data /config
USER node
EXPOSE 3000
CMD ["node","scripts/linux-start.mjs"]
