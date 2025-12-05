# frontend/Dockerfile - Build multi-stage
FROM node:20-alpine AS build

WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source et builder
COPY . .
RUN npm run build -- --configuration production

# Stage 2 : Nginx
FROM nginx:alpine

# Copier le build depuis le stage précédent
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copier la config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80