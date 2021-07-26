# Vivid (42-transcendence)
Because pong is so great

## Why?
Its a school project

## setup
You have two options here. run everything seperately **or** use docker compose

### docker-compose
1. Put all your `.env` files in `/config` (you can see examples of all files in `/config/examples`)
2. Run `docker compose up -d` in the root of the repository.
3. Done! :smile:

### manual setup
1. Put an `.env` file in `/vivid-client` and `/vivid-server` (you can see examples of all files in `/config/examples`)
2. Install dependencies
```sh
# vivid-client
cd vivid-client
npm install

# vivid-server
cd vivid-server
npm install
```
3. Run everything
```sh
# vivid-client (development)
cd vivid-client
npm run start

# vivid-server (development)
cd vivid-server
npm run start:dev

# vivid-client (production)
cd vivid-client
npm run start # ctrl+c after starting the server
npm run build # the build is now ready in /vivid-client/build

# vivid-server (production)
cd vivid-server
npm run build
node ./dist/main.js
```
