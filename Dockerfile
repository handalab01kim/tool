FROM node:22.14.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD node server