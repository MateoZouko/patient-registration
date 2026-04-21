FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
        git curl zip unzip libpq-dev libzip-dev libpng-dev libjpeg62-turbo-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql zip gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Scaffold Laravel 11 directly into /app (directory must not pre-exist)
RUN composer create-project laravel/laravel /app --prefer-dist --no-interaction

WORKDIR /app

# Copy our custom files over the scaffolded project
COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY resources/ resources/
COPY routes/ routes/
COPY tests/ tests/
COPY phpunit.xml phpunit.xml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN rm -f tests/Feature/ExampleTest.php tests/Unit/ExampleTest.php

RUN mkdir -p storage/app/public/uploads \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
