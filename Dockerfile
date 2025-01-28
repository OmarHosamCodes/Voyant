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

# ENV MONGO_USERNAME=support
# ENV MONGO_PASSWORD=Inboundlegendx-y12
# ENV MONGO_HOST=voyantdb.h7odd.mongodb.net
# ENV MONGO_OPTIONS=?retryWrites=true&w=majority&appName=VoyantDB
# ENV MONGO_DATABASE=VoyantDB
# ENV PORT=3000
# ENV RETRY_INTERVAL=86400000

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]
