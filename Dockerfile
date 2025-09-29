# path: ./Dockerfile
# Use a specific version of Node.js for reproducibility. Alpine is used for its small size.
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package management files first to leverage Docker's layer caching.
# If these files don't change, 'npm install' will not be re-run on subsequent builds.
COPY package.json ./
COPY package-lock.json* ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# Run the build script defined in your package.json.
# This should generate the distributable files in the /app/dist directory.
RUN npm run build

# The primary purpose of this Dockerfile is to create a build environment.
# The artifacts can be extracted using the 'make build-plugin' command.
CMD ["echo", "Build complete. Artifacts are in /app/dist."]