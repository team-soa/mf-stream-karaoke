FROM node:16.10-alpine as build-step

# Create new directory to work on
RUN mkdir -p /build

WORKDIR /build

COPY package.json /build
COPY package-lock.json /build

# Run init commands
RUN npm ci

COPY . /build

RUN npm run build

# Execute build on nginx servevr
FROM nginx:1.17.1-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build-step /build/dist/mf-stream-karaoke /usr/share/nginx/html