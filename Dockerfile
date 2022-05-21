FROM node:16.15-alpine3.14

WORKDIR /app

COPY . /app/
# COPY ./ormconfig.ts /app/
# COPY ./config/* /app/

COPY package*.json /app/

RUN npm ci \
    && npm run build

EXPOSE 3000
EXPOSE 80

CMD ["npm", "run", "start:prod"]