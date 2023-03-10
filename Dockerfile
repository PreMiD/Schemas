FROM node:current-alpine
WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml .
RUN pnpm i --frozen-lockfile

COPY . .

RUN pnpm --filter server build
RUN pnpm --filter server deploy pruned --prod

FROM node:current-alpine
WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

COPY --from=0 /app/pruned/dist .
COPY --from=0 /app/pruned/node_modules node_modules

EXPOSE 80

CMD [ "node", "index" ]
