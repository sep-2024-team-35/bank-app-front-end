# Stage 1: Build
# Stage 1: Build React App
FROM node:20-alpine AS ebanksep-fe-builder
LABEL maintainer="Luka Usljebrka lukauslje13@gmail.com"

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx + HTTPS
FROM nginx:alpine AS ebanksep-fe-server
LABEL maintainer="Luka Usljebrka lukauslje13@gmail.com"

ENV APP_NAME="eBankSEP-FE"
ENV PORT=443

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
COPY --from=ebanksep-fe-builder /app/dist /usr/share/nginx/html
COPY certs/cert.pem /etc/ssl/certs/cert.pem
COPY certs/key.pem /etc/ssl/private/key.pem

EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]