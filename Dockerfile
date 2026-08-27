FROM node:20-bookworm-slim
# Chromium + fontes + dependências
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      fontconfig \
      fonts-dejavu \
      fonts-liberation \
      fonts-noto-color-emoji \
      chromium \
    && rm -rf /var/lib/apt/lists/*
# Diz pro Puppeteer usar o Chromium do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/auth
CMD ["npm", "start"]
