FROM node:20-alpine AS base
RUN npm install -g pnpm@9

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter=@sari-saas/core build
RUN pnpm --filter=@sari-saas/api build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 sarisaas
RUN adduser --system --uid 1001 sarisaas
COPY --from=builder --chown=sarisaas:sarisaas /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER sarisaas
EXPOSE 3001
CMD ["node", "dist/index.js"]
