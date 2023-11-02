FROM --platform=linux/amd64 node:18.8-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json webpack.common.ts webpack.dev.ts webpack.prod.ts /app/
COPY server server
COPY client client
COPY shared shared

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm prune --prod

RUN rm -rf ./client
RUN rm -rf ./server
RUN rm -rf ./shared

ENV PORT 8080
EXPOSE $PORT

CMD node dist/server/server.js