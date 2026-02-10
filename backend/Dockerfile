FROM php:8.2-fpm

RUN apt-get update && apt-get install -y libicu-dev zip unzip git \
    && docker-php-ext-install intl pdo pdo_mysql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
EXPOSE 8000

# Comando para levantar el servidor de Symfony
CMD composer install && php bin/console doctrine:migrations:migrate --no-interaction && php -S 0.0.0.0:8000 -t public