FROM node:latest

COPY . /treecomex/
WORKDIR /treecomex/server
RUN npx npm add -g pnpm
RUN pnpm install
EXPOSE $APP_PORT
ENTRYPOINT [ "npm", "run", "start:prod" ]