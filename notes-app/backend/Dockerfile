# Use a lightweight Python base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the backend code into the container
COPY . /app

# Install Python dependencies
RUN  npm install

# Expose the Flask default port
EXPOSE 5000

# Set the default command to run the server
CMD ["node", "server.js"]
