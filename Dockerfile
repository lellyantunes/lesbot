FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/auth

CMD ["npm", "start"]

