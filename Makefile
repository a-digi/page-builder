# path: ./Makefile
# Makefile for building and managing the React component library

# --- Variables ---
# The name for the Docker image
IMAGE_NAME := react-page-builder-plugin
# The tag for the Docker image
TAG := latest
# The name for the temporary container used for exporting files
CONTAINER_NAME := $(IMAGE_NAME)-container-temp
# The name for the development container
DEV_CONTAINER_NAME := $(IMAGE_NAME)-container-dev

# Check if .env file exists and include it to load environment variables
ifneq (,$(wildcard ./.env))
    include .env
    export GITHUB_TOKEN
endif

# --- Targets ---

# This ensures that 'make' does not confuse these commands with actual files
.PHONY: all build-plugin build-image run stop clean publish login release-patch release-minor release-major

# Default target runs when you just type 'make'
all: build-plugin

# --- Release & Publish Targets ---

# Use these commands to create a new versioned release.

release-patch:  ## Creates a patch release (e.g., 0.1.0 -> 0.1.1)
	@echo "--> Creating a new PATCH release..."
	@npm version patch
	@git push && git push --tags
	@$(MAKE) publish

release-minor: ## Creates a minor release (e.g., 0.1.1 -> 0.2.0)
	@echo "--> Creating a new MINOR release..."
	@npm version minor
	@git push && git push --tags
	@$(MAKE) publish

release-major: ## Creates a major release (e.g., 0.2.0 -> 1.0.0)
	@echo "--> Creating a new MAJOR release..."
	@npm version major
	@git push && git push --tags
	@$(MAKE) publish


# --- Core Commands (used by release targets) ---

# Publish the package. This is now the main command to use.
# It automatically handles login, building, and publishing.
# This is called by the 'release-*' targets.
publish: login build-plugin
	@echo "--> Publishing to GitHub Packages..."
	@npm publish
	@echo "--> Package published successfully."

# Login: Creates a project-local .npmrc file for authentication.
# This is a safer and more reliable method than modifying the global ~/.npmrc.
login:
	@if [ -z "$${GITHUB_TOKEN}" ]; then \
		echo "!! ABORTED: GITHUB_TOKEN not found."; \
		echo "   Ensure you have a .env file with your GITHUB_TOKEN set."; \
		exit 1; \
	fi
	@echo "--> Creating local .npmrc for authentication..."
	@# The first line scopes your package to the GitHub registry.
	@# The second line provides the auth token for that registry.
	@echo "@a-digi:registry=https://npm.pkg.github.com/" > ./.npmrc
	@echo "//npm.pkg.github.com/:_authToken=$${GITHUB_TOKEN}" >> ./.npmrc
	@echo "--> Verifying authentication using local .npmrc..."
	@# The whoami command will fail if authentication is incorrect.
	@npm whoami --registry=https://npm.pkg.github.com

# --- Build & Development Commands ---

# Build the plugin: builds the Docker image and exports the 'dist' folder
build-plugin: build-image
	@echo "--> Exporting build artifacts from container..."
	@# Remove old dist folder to ensure a clean export
	@rm -rf ./dist
	@# Create a temporary container from the built image
	@docker create --name $(CONTAINER_NAME) $(IMAGE_NAME):$(TAG)
	@# Copy the /app/dist folder from the container to the host's root
	@docker cp $(CONTAINER_NAME):/app/dist ./dist
	@# Clean up and remove the temporary container
	@docker rm $(CONTAINER_NAME)
	@echo "--> Build complete. Artifacts are in the ./dist directory."

# Build the Docker image
build-image:
	@echo "--> Building Docker image '$(IMAGE_NAME):$(TAG)'..."
	@docker build -t $(IMAGE_NAME):$(TAG) .

# Run a container with an interactive shell for development/debugging.
# It mounts your current directory into the container, so changes are reflected instantly.
run:
	@echo "--> Starting interactive shell in development container..."
	@echo "--> Your current project directory is mounted at /app."
	@echo "--> Exit the shell (Ctrl+D) to stop and remove the container."
	@docker run -it --rm --name $(DEV_CONTAINER_NAME) \
		-v "$(shell pwd):/app" \
		$(IMAGE_NAME):$(TAG) /bin/sh

# Stop the development container if it's running
stop:
	@echo "--> Stopping container '$(DEV_CONTAINER_NAME)'..."
	@docker stop $(DEV_CONTAINER_NAME) || echo "Container not running or already stopped."

# Clean up build artifacts and any leftover containers
clean:
	@echo "--> Cleaning up build artifacts and containers..."
	@rm -rf ./dist ./.npmrc
	@docker rm -f $(CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker rm -f $(DEV_CONTAINER_NAME) >/dev/null 2>&1 || true
	@echo "--> Cleanup complete."