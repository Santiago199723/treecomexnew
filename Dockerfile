FROM node:20

COPY . /treecomex-backend/
WORKDIR /treecomex-backend/
RUN npm install
EXPOSE 3000
ENTRYPOINT [ "npm", "run", "start:prod" ]