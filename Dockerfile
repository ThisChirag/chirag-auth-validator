FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm@9.14.2

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN npm install -g nodemon@3.1.9

COPY . .

RUN pnpm run build

COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

ENV NODE_ENV=development

ENTRYPOINT ["entrypoint.sh"]

CMD ["nodemon", "--watch", "src", "--ext", "ts", "--exec", "pnpm run build && node dist/server.js"]
