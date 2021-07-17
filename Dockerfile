FROM node:current-alpine


COPY server .

RUN yarn
RUN yarn build

FROM node:current-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=0 /dist/ .

RUN yarn

EXPOSE 8080

CMD [ "node", "index" ]