FROM poetapp/base:10.14.2-alpine as builder

COPY package*.json /tmp/
RUN cd /tmp && npm ci
RUN mkdir -p /usr/src/app/ && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app/
ADD . /usr/src/app/

RUN npm run build

FROM node:10.14.2-alpine as app

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY Docker/tools/wait-for-it.sh /
RUN chmod +x /wait-for-it.sh

COPY --from=builder /usr/src/app .

CMD [ "npm", "start" ]