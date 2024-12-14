FROM node 
WORKDIR /app
COPY package.json ./
RUN npm i
COPY src/ ./src/
COPY tsconfig.json ./tsconfig.json
CMD [ "npm","start"]
