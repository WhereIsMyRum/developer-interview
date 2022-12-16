
FROM node:16.14.0-buster-slim as base
USER node:node

RUN mkdir -p /home/node/transaction-api
WORKDIR /home/node/transaction-api


FROM base as base_dev
USER root:root
RUN apt-get update 

USER node:node

FROM base_dev as app_dev_node_modules

COPY --chown=node:node ./package.json ./package-lock.json ./
RUN npm install --frozen-lockfile

FROM app_dev_node_modules as app_dev_build

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tsconfig.json ./index.ts ./nodemon.json ./

RUN npm run build

FROM app_dev_build as dev

CMD ["npm", "run", "dev"]

