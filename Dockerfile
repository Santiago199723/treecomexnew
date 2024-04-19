FROM node:20

COPY . /treecomex/
WORKDIR /treecomex/
RUN npm install
EXPOSE 3000
ENTRYPOINT [ "npm", "run", "start:prod" ]