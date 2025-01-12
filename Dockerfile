# Use Node.js image that includes Chrome
FROM oven/bun:latest

# Install Chrome dependencies and networking tools
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

# Update CA certificates
RUN update-ca-certificates

# Set environment variables for Chrome
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
RUN bun install

# Bundle app source
COPY . .

EXPOSE 3000
# Create a new tmux session and run the application
CMD [ "bun","run","start" ]
