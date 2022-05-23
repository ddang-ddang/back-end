FROM node:16

WORKDIR /app

#nginx 테스트를 위해...

COPY package*.json ./

# CMD echo ls -al 
COPY ./ ./
RUN npm install  \
    && npm run build 

CMD [ "npm", "run", "start:prod" ]

EXPOSE 8080 
EXPOSE 3306