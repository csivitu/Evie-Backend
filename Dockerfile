FROM node:latest
WORKDIR /backend
COPY package.json /backend
RUN npm install
COPY . /backend
CMD node index.js
EXPOSE 3001