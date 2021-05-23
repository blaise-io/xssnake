# syntax=docker/dockerfile:1.0

FROM node:alpine AS main
WORKDIR /xssnake

FROM main as server_packages
COPY package*.json /xssnake/
RUN npm ci --production

FROM main as app_code
COPY package*.json /xssnake/
COPY src/ /xssnake/src/
RUN npm ci
RUN npm run client.production
RUN npm run server.production

FROM main
COPY --from=app_code /xssnake/dist/ /xssnake/
COPY --from=server_packages /xssnake/node_modules/ /xssnake/node_modules/
ENV PATH="/xssnake/node_modules/.bin:$PATH"
EXPOSE 8001 8002
CMD sh -c "node /xssnake/server.js 8001 & nano-server 8002"
