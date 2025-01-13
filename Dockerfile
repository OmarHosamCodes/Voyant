FROM oven/bun:1.1.43

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

#? For Future Reference
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 


RUN update-ca-certificates

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY bun.lockb ./
RUN bun install

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]
