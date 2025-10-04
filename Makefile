# path: ./react-page-builder/Makefile
IMAGE_NAME := react-page-builder-plugin
TAG := latest
CONTAINER_NAME := $(IMAGE_NAME)-container-temp
DEV_CONTAINER_NAME := $(IMAGE_NAME)-container-dev
WATCH_CONTAINER_NAME := $(IMAGE_NAME)-container-watch

ifneq (,$(wildcard ./.env))
    include .env
    export GITHUB_TOKEN
endif

all: build-plugin
.PHONY: all

release-patch:
	@echo "--> Creating a new PATCH release..."
	@npm version patch
	@git push && git push --tags
	@$(MAKE) publish
.PHONY: release-patch

release-minor:
	@echo "--> Creating a new MINOR release..."
	@npm version minor
	@git push && git push --tags
	@$(MAKE) publish
.PHONY: release-minor

release-major:
	@echo "--> Creating a new MAJOR release..."
	@npm version major
	@git push && git push --tags
	@$(MAKE) publish
.PHONY: release-major

publish: login build-plugin
	@echo "--> Publishing to GitHub Packages..."
	@npm publish
	@echo "--> Package published successfully."
.PHONY: publish

login:
	@if [ -z "$${GITHUB_TOKEN}" ]; then \
		echo "!! ABORTED: GITHUB_TOKEN not found."; \
		echo "   Ensure you have a .env file with your GITHUB_TOKEN set."; \
		exit 1; \
	fi
	@echo "--> Creating local .npmrc for authentication..."
	@echo "@a-digi:registry=https://npm.pkg.github.com/" > ./.npmrc
	@echo "//npm.pkg.github.com/:_authToken=$${GITHUB_TOKEN}" >> ./.npmrc
	@echo "--> Verifying authentication using local .npmrc..."
	@npm whoami --registry=https://npm.pkg.github.com
.PHONY: login

run-watch: build-image
	@echo "--> Starting background container to watch for file changes..."
	@docker run --rm --name $(WATCH_CONTAINER_NAME) \
		-v "$(shell pwd):/pb/app" \
		$(IMAGE_NAME):$(TAG) npm run build:watch
	@echo "--> Watcher started. Container '$(WATCH_CONTAINER_NAME)' is running."
	@echo "--> To view logs, run: docker logs -f $(WATCH_CONTAINER_NAME)"
.PHONY: run-watch

run-install: build-image
	@echo "--> Starting background container to watch for file changes..."
	@docker run --rm --name $(WATCH_CONTAINER_NAME) \
		-v "$(shell pwd):/pb/app" \
		$(IMAGE_NAME):$(TAG) npm install
	@echo "--> Watcher started. Container '$(WATCH_CONTAINER_NAME)' is running."
	@echo "--> To view logs, run: docker logs -f $(WATCH_CONTAINER_NAME)"
.PHONY: run-install

stop-watch:
	@echo "--> Stopping background watcher container '$(WATCH_CONTAINER_NAME)'..."
	@docker stop $(WATCH_CONTAINER_NAME) || echo "Container not running or already stopped."
PHONY: stop-watch

build-plugin: build-image
	@echo "--> Exporting build artifacts from container..."
	@rm -rf ./dist
	@docker create --name $(CONTAINER_NAME) $(IMAGE_NAME):$(TAG)
	@docker cp $(CONTAINER_NAME):/pb/app/dist ./dist
	@docker rm $(CONTAINER_NAME)
	@echo "--> Build complete. Artifacts are in the ./dist directory."
.PHONY: build-plugin

build-image:
	@echo "--> Building Docker image '$(IMAGE_NAME):$(TAG)'..."
	@docker build -t $(IMAGE_NAME):$(TAG) .
.PHONY: build-image

run:
	@echo "--> Starting interactive shell in development container..."
	@docker run -it --rm --name $(DEV_CONTAINER_NAME) \
		-v ${PWD}:/pb/app:delegated \
		$(IMAGE_NAME):$(TAG) /bin/sh
.PHONY: run

stop:
	@echo "--> Stopping container '$(DEV_CONTAINER_NAME)'..."
	@docker stop $(DEV_CONTAINER_NAME) || echo "Container not running or already stopped."
.PHONY: stop

clean:
	@echo "--> Cleaning up build artifacts and containers..."
	@rm -rf ./dist ./.npmrc
	@docker rm -f $(CONTAINER_NAME) $(WATCH_CONTAINER_NAME) $(DEV_CONTAINER_NAME) >/dev/null 2>&1 || true
	@echo "--> Cleanup complete."
.PHONY: clean