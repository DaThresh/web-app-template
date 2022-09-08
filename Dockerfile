FROM --platform=linux/amd64 node:18.8-slim

WORKDIR /app

COPY package.json yarn.lock tsconfig.json webpack.common.ts webpack.dev.ts webpack.prod.ts /app/

RUN yarn install

COPY server server
COPY client client
COPY shared shared

RUN yarn build
RUN rm -rf ./client
RUN rm -rf ./server
RUN rm -rf ./shared

RUN rm -rf node_modules
RUN yarn install --production --ignore-scripts --prefer-offline
RUN yarn cache clean

ENV PORT 8080
EXPOSE $PORT

CMD node dist/server/server.js