# syntax=docker/dockerfile:1

# Stage 0: Build
FROM node:18-bookworm-slim as build
WORKDIR /app

COPY package*.json ./

# Stage 1: Production dependencies
FROM build as production
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
ENV NODE_ENV=production

RUN npm ci --only=production
COPY . .
CMD ["dumb-init", "node", "index.js"]

# Stage 2: Development dependencies
FROM build as development

ENV NODE_ENV=development

RUN npm install
COPY . .
CMD ["npm", "run", "dev"]




