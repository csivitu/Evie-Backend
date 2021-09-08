FROM node:14.17.5
WORKDIR /backend
COPY package.json /backend
RUN npm install --silent
COPY . /backend
CMD node index.js