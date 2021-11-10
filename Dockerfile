FROM node:12.19.0-alpine3.9 AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

ENV CONFIG_ENCRYPTION_KEY=635a0aacce00b49d3186e33b410ecf3eede5d6f47b3486c33b81207c587ee41f

RUN npm run build

FROM node:12.19.0-alpine3.9 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

ENV CONFIG_ENCRYPTION_KEY=635a0aacce00b49d3186e33b410ecf3eede5d6f47b3486c33b81207c587ee41f

CMD ["node", "dist/main"]