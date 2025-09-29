# path: ./Dockerfile
FROM node:20-alpine AS builder

WORKDIR /pb/app

COPY package.json ./
COPY package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

CMD ["echo", "Build complete. Artifacts are in /pb/app/dist."]