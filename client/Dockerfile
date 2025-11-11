# Dockerfile for client application

# ---- Build Stage ----
# Use a specific Node.js version on a lightweight Alpine Linux base
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
# This is done separately to leverage Docker layer caching.
# The 'npm ci' command will only be re-run if these files change.
COPY package*.json ./

# Install dependencies using 'npm ci' which is faster and more reliable for builds
RUN npm ci

# Copy the rest of the application's source code.
# The .dockerignore file prevents node_modules, .git, etc., from being copied.
COPY . .

# Run the build script defined in package.json
# This creates a 'dist' folder with the production-ready static files.
RUN npm run build


# ---- Production Stage ----
# Use a stable, lightweight Nginx image
FROM nginx:stable-alpine

# Remove the default Nginx configuration to ensure our settings are applied.
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'build' stage to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to document that the container listens on this port
EXPOSE 80

# Start Nginx in the foreground when the container launches
CMD ["nginx", "-g", "daemon off;"]
