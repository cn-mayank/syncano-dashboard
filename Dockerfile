FROM node:10.14.0-jessie
ADD . /data/
WORKDIR data
RUN npm install
CMD tail -f /dev/null
