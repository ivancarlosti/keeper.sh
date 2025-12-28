FROM oven/bun:1 AS foundation
WORKDIR /app

FROM foundation AS prepare
RUN bun install --global turbo
COPY . .
RUN turbo prune @keeper.sh/web --docker

FROM foundation AS run
COPY --from=prepare /app/out/json/ .

RUN bun install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

CMD ["bun", "start"]
