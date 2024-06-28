FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_SHARP_PATH=/node_modules/sharp \
    NEXT_PUBLIC_DI_KEY=71874087f30042e8a186cc1ded0d5b8c \
    CONTABO_STORAGE_ACCESS_KEY=4c9acf629f9d4b25a6810dd2a5bd8997 \
    CONTABO_STORAGE_SECRET_KEY=e9147150b63c5deee60b83989321e7a8

RUN corepack enable

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000 \
    HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]