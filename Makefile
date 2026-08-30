.DEFAULT_GOAL := help

COMPOSE      := docker compose --env-file .env.docker
COMPOSE_FILE := -f docker-compose.yml
COMPOSE_PROD := $(COMPOSE) --profile prod $(COMPOSE_FILE)
DEV_SERVICE  := frontend-dev
PROD_SERVICE := frontend

.PHONY: help init build up down restart logs ps shell npm clean prod-build prod-up prod-down

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

init: ## Copy Docker env template
	@if [ ! -f .env.docker ]; then cp .env.docker.example .env.docker && echo "Created .env.docker"; fi

build: init ## Build production Docker image
	$(COMPOSE_PROD) build

up: init ## Start development server (hot reload)
	$(COMPOSE) $(COMPOSE_FILE) up -d $(DEV_SERVICE)

down: ## Stop all containers
	$(COMPOSE) $(COMPOSE_FILE) down --remove-orphans

restart: down up ## Restart development server

logs: ## Tail development logs
	$(COMPOSE) $(COMPOSE_FILE) logs -f $(DEV_SERVICE)

ps: ## Show running containers
	$(COMPOSE) $(COMPOSE_FILE) ps

shell: ## Open shell in dev container
	$(COMPOSE) $(COMPOSE_FILE) exec $(DEV_SERVICE) sh

npm: ## Run npm command (usage: make npm cmd="run build")
	$(COMPOSE) $(COMPOSE_FILE) exec $(DEV_SERVICE) npm $(cmd)

clean: ## Stop containers and remove volumes
	$(COMPOSE) $(COMPOSE_FILE) down -v --remove-orphans

prod-build: init ## Build production image
	$(COMPOSE_PROD) build $(PROD_SERVICE)

prod-up: init ## Start production nginx server
	$(COMPOSE_PROD) up -d $(PROD_SERVICE)

prod-down: ## Stop production server
	$(COMPOSE_PROD) down --remove-orphans
