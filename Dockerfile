FROM node:20-bookworm-slim

# Instala fontes + fontconfig (necessário pro Sharp renderizar texto)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      fontconfig \
      fonts-dejavu \
      fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/auth
CMD ["npm", "start"]
