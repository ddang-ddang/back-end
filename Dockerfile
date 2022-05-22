FROM node:16


WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN npm install \ 
&& npm run build



EXPOSE 8080

# CMD [ "node", "./dist/src/main.js" ]
CMD [ "npm", "run", "start:prod" ]