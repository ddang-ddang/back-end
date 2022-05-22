FROM node:16

WORKDIR /app

COPY package*.json ./
COPY ./ ./
COPY ./config ./

RUN npm install \ 
&& npm run build

EXPOSE 8081 

CMD [ "npm", "run", "start:prod" ]