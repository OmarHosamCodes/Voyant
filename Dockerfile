FROM oven/bun:latest

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
