FROM node:18-alpine
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install
# Bundle app source
COPY . .
# Build arguments
ARG NODE_VERSION=18-alpine
# Environment
ENV NODE_VERSION $NODE_VERSION
