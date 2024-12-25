FROM node:18-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@9.14.2

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy

RUN pnpm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm@9.14.2

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8080

CMD ["node", "dist/server.js"]
