FROM node:lts as react

# rely on caching if we don't need to npm install (ie: no change to package.json)
RUN mkdir -p /cosmos-webapi
WORKDIR /cosmos-webapi
COPY package.json ./
RUN npm install

COPY . ./
RUN echo "DB_URI=mongodb://localhost:27017/\n" \
         "WEBSOCKET_PORT=8081\n" \
         "API_PORT=8082\n" \
         "COSMOS_DIR=/cosmos/\n" \
         "HOST_NODE=cubesat1\n" > .env


CMD ["npm", "run", "dev"]
