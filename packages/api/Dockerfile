FROM oven/bun:1 AS foundation
WORKDIR /app

FROM foundation AS prepare
RUN bun install --global turbo
COPY . .
RUN turbo prune @keeper.sh/api --docker

FROM foundation AS build
COPY --from=prepare /app/out/json/ .
RUN bun install --frozen-lockfile

COPY --from=prepare /app/out/full/ .
RUN bun run build --filter=@keeper.sh/api

FROM foundation AS runtime
RUN bun install --global turbo

COPY --from=prepare /app/out/json/ .
RUN bun install --frozen-lockfile --production

COPY --from=build /app/turbo.json ./turbo.json
COPY --from=build /app/packages/api/dist ./packages/api/dist
COPY --from=build /app/packages/api/package.json ./packages/api/package.json
COPY --from=build /app/packages/database ./packages/database

ENV NODE_ENV=production
EXPOSE 3001

CMD ["turbo", "migrate", "start"]
