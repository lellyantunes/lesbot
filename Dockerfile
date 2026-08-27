FROM node:20-bookworm-slim
# Instala fontes + fontconfig + dependências nativas do canvas
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      fontconfig \
      fonts-dejavu \
      fonts-liberation \
      fonts-noto-color-emoji \
      build-essential \
      libcairo2-dev \
      libpango1.0-dev \
      libjpeg-dev \
      libgif-dev \
      librsvg2-dev \
      libpixman-1-dev \
      pkg-config \
      python3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/auth
CMD ["npm", "start"]
