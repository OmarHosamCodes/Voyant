FROM oven/bun:1.2

RUN apt-get update && apt-get install -y chromium 

ENV CHROME_BIN=/usr/bin/chromium

RUN update-ca-certificates

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY .env ./
COPY bun.lock ./
RUN bun install

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]
