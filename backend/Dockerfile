FROM php:8.2-fpm-alpine

# Instalar dependencias del sistema y extensiones de PHP necesarias para MySQL y Symfony
RUN apk add --no-cache \
    bash \
    icu-dev \
    libpq-dev \
    git \
    unzip

RUN docker-php-ext-install \
    pdo_mysql \
    intl \
    opcache

# Instalar Composer (el gestor de paquetes de PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
