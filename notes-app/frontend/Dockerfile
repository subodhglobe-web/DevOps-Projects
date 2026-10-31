# Stage 1: Build the React App
FROM node:16-alpine as build

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json  .
RUN  npm  install

# Copy the source code
COPY . /app

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the nginx conf file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx website and replace with our build
RUN rm -rf /usr/share/nginx/html/*

# Copy React build from previous stage to Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
