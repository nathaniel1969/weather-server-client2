# Stage 1: Build the React application
# This stage builds the React application and creates a production-ready build.
FROM node:20-alpine AS build

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache.
# This step is separate from copying the rest of the source code, so that
# dependencies are not re-installed every time the source code changes.
COPY package*.json ./

# Install app dependencies.
RUN npm install

# Bundle app source.
COPY . .

# Build the React application for production.
RUN npm run build

# Stage 2: Serve the application with Nginx
# This stage uses a lightweight Nginx image to serve the built React application.
FROM nginx:stable-alpine

# Copy the built app from the build stage to the Nginx public directory.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file.
# This file includes a proxy to the backend service.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to allow traffic to the Nginx server.
EXPOSE 80

# Start Nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]