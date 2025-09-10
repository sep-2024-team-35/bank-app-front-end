# Stage 1: Build
# Stage 1: Build React App
FROM node:20-alpine AS ebanksep-fe-builder
LABEL maintainer="Luka Usljebrka lukauslje13@gmail.com"

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx (no SSL)
FROM nginx:alpine AS ebanksep-fe-server
LABEL maintainer="Luka Usljebrka lukauslje13@gmail.com"

ENV APP_NAME="eBankSEP-FE"
ENV PORT=80

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=ebanksep-fe-builder /app/dist /usr/share/nginx/html

EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]