#!/bin/bash

# Docker build script for Learning Platform
# Usage: ./scripts/docker-build.sh [tag]

set -e

# Configuration
IMAGE_NAME="learning-platform"
DEFAULT_TAG="latest"
TAG=${1:-$DEFAULT_TAG}
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

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

print_status "Building Docker image: $FULL_IMAGE_NAME"

# Build the image
docker build \
    --tag "$FULL_IMAGE_NAME" \
    --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    --build-arg VERSION="$TAG" \
    .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully: $FULL_IMAGE_NAME"
    
    # Show image details
    print_status "Image details:"
    docker images "$IMAGE_NAME" | head -2
    
    # Get image size
    IMAGE_SIZE=$(docker images --format "table {{.Size}}" "$FULL_IMAGE_NAME" | tail -1)
    print_status "Image size: $IMAGE_SIZE"
    
    # Optional: Tag as latest if building a specific version
    if [ "$TAG" != "latest" ] && [ "$TAG" != "" ]; then
        print_status "Tagging as latest..."
        docker tag "$FULL_IMAGE_NAME" "$IMAGE_NAME:latest"
        print_success "Tagged as $IMAGE_NAME:latest"
    fi
    
    print_success "Build completed successfully!"
    echo ""
    print_status "To run the container:"
    echo "  docker run -p 8080:80 $FULL_IMAGE_NAME"
    echo ""
    print_status "Or use docker-compose:"
    echo "  docker-compose up -d"
    
else
    print_error "Docker build failed!"
    exit 1
fi 