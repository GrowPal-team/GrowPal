FROM composer:2 AS composer_deps
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress

FROM php:8.2-apache
WORKDIR /var/www/html

RUN docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite headers

COPY . /var/www/html
COPY --from=composer_deps /app/vendor /var/www/html/vendor

RUN mkdir -p /var/www/html/public/uploads/products \
    && chown -R www-data:www-data /var/www/html/public/uploads
