FROM node:22

WORKDIR /app

# Instalamos dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200