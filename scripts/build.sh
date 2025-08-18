#!/bin/bash

# Build script for MUI Beta application
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="mui-beta"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"
BUILD_TARGET="${BUILD_TARGET:-runner}"
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"

echo -e "${GREEN}🚀 Starting MUI Beta application build...${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
fi

# Validate build target
if [[ "$BUILD_TARGET" != "runner" && "$BUILD_TARGET" != "development" ]]; then
    error "Invalid build target: $BUILD_TARGET. Must be 'runner' or 'development'"
fi

log "Building Docker image: $IMAGE_NAME:$IMAGE_TAG"
log "Build target: $BUILD_TARGET"
log "Platform: $PLATFORM"

# Build the Docker image
if [[ "$BUILD_TARGET" == "development" ]]; then
    DOCKERFILE="Dockerfile.dev"
else
    DOCKERFILE="Dockerfile"
fi

log "Using Dockerfile: $DOCKERFILE"

# Build with buildx for multi-platform support
docker buildx build \
    --platform $PLATFORM \
    --target $BUILD_TARGET \
    --tag $IMAGE_NAME:$IMAGE_TAG \
    --file $DOCKERFILE \
    --progress=plain \
    --pull \
    .

if [ $? -eq 0 ]; then
    log "✅ Docker image built successfully: $IMAGE_NAME:$IMAGE_TAG"
else
    error "❌ Docker image build failed"
fi

# Tag for registry if specified
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    log "Tagging image for registry: $FULL_IMAGE_NAME"
    docker tag $IMAGE_NAME:$IMAGE_TAG $FULL_IMAGE_NAME
    
    # Push to registry
    if [ "$PUSH_TO_REGISTRY" == "true" ]; then
        log "Pushing image to registry: $FULL_IMAGE_NAME"
        docker push $FULL_IMAGE_NAME
        if [ $? -eq 0 ]; then
            log "✅ Image pushed successfully to registry"
        else
            error "❌ Failed to push image to registry"
        fi
    fi
fi

# Run security scan if requested
if [ "$SECURITY_SCAN" == "true" ]; then
    log "Running security scan with Trivy..."
    if command -v trivy >/dev/null 2>&1; then
        trivy image --exit-code 1 --severity HIGH,CRITICAL $IMAGE_NAME:$IMAGE_TAG
        if [ $? -eq 0 ]; then
            log "✅ Security scan passed"
        else
            warn "⚠️  Security scan found vulnerabilities"
        fi
    else
        warn "Trivy not found. Skipping security scan."
    fi
fi

# Test the image
log "Testing the built image..."
CONTAINER_ID=$(docker run -d --rm -p 3001:3000 $IMAGE_NAME:$IMAGE_TAG)

# Wait for container to start
sleep 10

# Health check
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    log "✅ Health check passed"
else
    warn "⚠️  Health check failed"
fi

# Clean up test container
docker stop $CONTAINER_ID >/dev/null 2>&1

log "🎉 Build process completed successfully!"
log "Image: $IMAGE_NAME:$IMAGE_TAG"
log "Size: $(docker images $IMAGE_NAME:$IMAGE_TAG --format "table {{.Size}}" | tail -n 1)"

echo -e "${GREEN}🏁 Build finished!${NC}"