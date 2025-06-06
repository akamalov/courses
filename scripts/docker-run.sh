#!/bin/bash

# Docker run script for Learning Platform
# Usage: ./scripts/docker-run.sh [port] [environment]

set -e

# Configuration
IMAGE_NAME="learning-platform:latest"
DEFAULT_PORT="8080"
PORT=${1:-$DEFAULT_PORT}
ENVIRONMENT=${2:-"development"}
CONTAINER_NAME="learning-platform-web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if image exists
if ! docker image inspect $IMAGE_NAME &> /dev/null; then
    print_warning "Image $IMAGE_NAME not found. Building it first..."
    ./scripts/docker-build.sh
fi

# Stop and remove existing container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    print_status "Stopping existing container..."
    docker stop $CONTAINER_NAME &> /dev/null || true
    docker rm $CONTAINER_NAME &> /dev/null || true
fi

print_status "Starting Learning Platform container..."
print_status "Port: $PORT"
print_status "Environment: $ENVIRONMENT"

# Run the container
docker run \
    --name $CONTAINER_NAME \
    --detach \
    --restart unless-stopped \
    --port $PORT:80 \
    --env ENVIRONMENT=$ENVIRONMENT \
    --health-cmd="wget --quiet --tries=1 --spider http://localhost/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --health-start-period=10s \
    $IMAGE_NAME

if [ $? -eq 0 ]; then
    print_success "Container started successfully!"
    
    # Wait a moment for the container to start
    sleep 2
    
    # Check container status
    CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER_NAME)
    print_status "Container status: $CONTAINER_STATUS"
    
    if [ "$CONTAINER_STATUS" = "running" ]; then
        print_success "Learning Platform is running at: http://localhost:$PORT"
        echo ""
        print_status "Available endpoints:"
        echo "  🏠 Homepage: http://localhost:$PORT"
        echo "  📚 N8N Course: http://localhost:$PORT/courses/n8n/"
        echo "  🏥 Health Check: http://localhost:$PORT/health"
        echo ""
        print_status "Container management:"
        echo "  Stop:    docker stop $CONTAINER_NAME"
        echo "  Logs:    docker logs $CONTAINER_NAME"
        echo "  Shell:   docker exec -it $CONTAINER_NAME sh"
        echo "  Remove:  docker rm -f $CONTAINER_NAME"
    else
        print_error "Container failed to start properly"
        print_status "Checking logs..."
        docker logs $CONTAINER_NAME
        exit 1
    fi
else
    print_error "Failed to start container!"
    exit 1
fi 