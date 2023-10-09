FROM node:18.16.0-alpine3.17 AS base

ARG COMMIT="unavailable"
ARG APPLICATION="unavailable"

RUN mkdir /app && chown node:node /app
WORKDIR /app
COPY package*json ./

# Builder and dependencies intermediate stage
FROM base AS base_dependencies
RUN npm set progress=false && npm config set depth 0
RUN npm pkg delete scripts.prepare

# Application builder
FROM base_dependencies AS builder
COPY . .
RUN npm ci
RUN npm run build $APPLICATION

# Production dependencies
FROM base_dependencies AS production_dependencies
RUN npm ci --omit=dev

# Production execution stage
FROM base AS production

RUN apk add --no-cache tini

COPY envs ./envs
COPY --from=builder /app/dist ./dist
COPY tsconfig*json ./
COPY apps/${APPLICATION}/tsconfig*json ./
COPY --from=production_dependencies /app/node_modules ./node_modules
RUN ln -s ./dist/apps/${APPLICATION}/main.js main.js

RUN date -u "+%Y-%m-%d %H:%M:%S" > ./build-date.txt
RUN echo $COMMIT > ./commit-hash.txt

USER node
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "node", "main.js" ]
