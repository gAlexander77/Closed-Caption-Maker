FROM node:18.13.0 as build

WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend .

RUN npm run build

FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
