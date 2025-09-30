# Use an official Node.js runtime as a parent image.
# Using a specific version (20-alpine) ensures consistency and a small image size.
FROM node:20-alpine

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache.
# This step is separate from copying the rest of the source code, so that
# dependencies are not re-installed every time the source code changes.
COPY package*.json ./

# Install only production dependencies to keep the image size small.
RUN npm install --production

# Bundle app source.
COPY . .

# Expose port 3001 to allow traffic to the backend server.
EXPOSE 3001

# Define the command to run the backend server.
CMD [ "node", "server.js" ]