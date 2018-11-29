FROM node:10.14.0-jessie
ADD . /syncano/
WORKDIR syncano
RUN npm install
CMD npm start
