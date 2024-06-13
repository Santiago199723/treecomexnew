# Usa a imagem do Node.js 20 como base
FROM node:20

# Define o diretório de trabalho como /treecomex
WORKDIR /treecomex

# Copia todos os arquivos para o diretório de trabalho
COPY . .

# Instala o pnpm globalmente
RUN npm install -g pnpm

# Instala as dependências utilizando o pnpm
RUN pnpm install

# Expõe a porta definida na variável de ambiente APP_PORT
EXPOSE $APP_PORT

# Define o comando de início como pnpm start
ENTRYPOINT [ "pnpm", "start" ]
