FROM node:14.17.5
ENV TZ="Asia/Kolkata"
WORKDIR /backend
COPY package.json /backend
RUN npm install --silent
COPY . /backend
CMD node index.js