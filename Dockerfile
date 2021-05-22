# docker build . -t xssnake
# docker run --rm -p 8001:8001 -p 8002:8002 -it xssnake
# open http://127.0.0.1:8002

FROM node:slim

WORKDIR /xssnake

COPY . /xssnake/

RUN npm ci --production
RUN npm run client.production
RUN npm run server.production

EXPOSE 8001 8002

CMD bash -c "npx nano-server 8002 dist & node dist/server.js"
