FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    chromium \
    chromium-sandbox \
    iputils-ping \
    dnsutils \
    net-tools \
    curl

ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY bun.lockb ./
RUN bun i

# Bundle app source
COPY . .

EXPOSE 3000

CMD bun run start
