# Variables para simplificar
DOCKER_COMPOSE = docker compose

# Comando por defecto: levanta todo en segundo plano
up:
	$(DOCKER_COMPOSE) up -d

# Baja todos los contenedores
down:
	$(DOCKER_COMPOSE) down

# Limpieza total: borra contenedores y también los datos de la base de datos (volúmenes)
clean:
	$(DOCKER_COMPOSE) down -v

# Entrar directamente a la terminal del backend (muy útil para depurar)
sh:
	$(DOCKER_COMPOSE) exec backend sh

# Ejecutar las migraciones de Symfony para crear las tablas en MySQL
migrate:
	$(DOCKER_COMPOSE) exec backend php bin/console doctrine:migrations:migrate --no-interaction

# Ver los logs de ngrok para encontrar la URL pública
logs-ngrok:
	docker logs ngrok_micro

# Instalar dependencias de PHP dentro del contenedor
install:
	$(DOCKER_COMPOSE) exec backend composer install
