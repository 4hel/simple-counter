# syntax=docker/dockerfile:1.7

# ---------- Build stage (all deps, builds client + server) ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install all workspaces deps (incl. devDeps for vite/tsc/prisma).
# Use `npm install` (not `npm ci`) so platform-specific optional deps
# (e.g. @rolldown/binding-linux-arm64-musl, only present on Linux) get
# resolved at install time even though the lockfile was generated on macOS.
# See https://github.com/npm/cli/issues/4828
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
# The lockfile was generated on macOS so it pins macOS-only optional deps
# of `rolldown`/`vite` (#4828). Removing it forces npm to resolve the
# Linux variants for the build platform.
RUN rm -f package-lock.json \
    && npm install --include=optional --no-audit --no-fund

# Copy sources.
COPY client ./client
COPY server ./server

# Build client (Vite -> client/dist).
RUN npm --workspace @simple-counter/client run build

# Generate Prisma client + compile server (tsc -> server/dist).
RUN npx --workspace @simple-counter/server prisma generate --schema prisma/schema.prisma
RUN npm --workspace @simple-counter/server run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
# Absolute path to the built SPA, consumed by server/src/index.ts.
ENV STATIC_DIR=/app/client/dist
ENV PORT=3000

WORKDIR /app/server

# Reuse the build stage's node_modules so the generated Prisma client and any
# hoisted packages are wherever npm placed them. (Trades a slightly larger image
# for build-time simplicity / reliability.)
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/server/node_modules /app/server/node_modules

# Server build output + package.json + Prisma schema.
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/package.json ./package.json
COPY --from=build /app/server/prisma ./prisma

# Root package.json so `node` resolves the workspace root correctly.
COPY --from=build /app/package.json /app/package.json

# Client build output served as static files via STATIC_DIR.
COPY --from=build /app/client/dist /app/client/dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
