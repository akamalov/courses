# Use official nginx image as base
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy website files to nginx html directory
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Add metadata
LABEL maintainer="Learning Platform Team"
LABEL description="Interactive Learning Platform with Authentication"
LABEL version="1.0"

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 