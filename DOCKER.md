# Docker Deployment Guide

This guide explains how to run the Learning Platform using Docker for better portability and easier deployment.

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Option 2: Using Build Scripts

```bash
# Build the Docker image
./scripts/docker-build.sh

# Run the container
./scripts/docker-run.sh
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build -t learning-platform .

# Run the container
docker run -d -p 8080:80 --name learning-platform-web learning-platform
```

## 🏗️ Architecture

The Docker setup uses:
- **Base Image**: `nginx:alpine` (lightweight and secure)
- **Web Server**: Nginx with custom configuration
- **Port**: 80 (internal) → 8080 (host)
- **Health Checks**: Built-in health monitoring
- **Security**: HTTP security headers and access controls

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Main container definition |
| `docker-compose.yml` | Multi-service orchestration |
| `nginx.conf` | Custom Nginx configuration |
| `.dockerignore` | Excludes unnecessary files |
| `404.html` | Custom error page |
| `scripts/docker-build.sh` | Build automation script |
| `scripts/docker-run.sh` | Run automation script |

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NGINX_HOST` | `localhost` | Server hostname |
| `NGINX_PORT` | `80` | Internal port |
| `ENVIRONMENT` | `development` | Deployment environment |

### Port Configuration

- **Default**: `8080:80` (host:container)
- **Customizable**: Change in `docker-compose.yml` or script parameters

### Health Checks

The container includes health monitoring:
- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

## 🛠️ Development Workflow

### Building Images

```bash
# Build with default tag (latest)
./scripts/docker-build.sh

# Build with custom tag
./scripts/docker-build.sh v1.0.0

# Build with debugging
docker build --no-cache -t learning-platform .
```

### Running Containers

```bash
# Run on default port (8080)
./scripts/docker-run.sh

# Run on custom port
./scripts/docker-run.sh 9000

# Run with environment
./scripts/docker-run.sh 8080 production
```

### Container Management

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Check container logs
docker logs learning-platform-web

# Execute shell in container
docker exec -it learning-platform-web sh

# Stop container
docker stop learning-platform-web

# Remove container
docker rm learning-platform-web

# Remove image
docker rmi learning-platform
```

## 🌐 Accessing the Application

Once running, access the platform at:

- **Homepage**: http://localhost:8080
- **N8N Course**: http://localhost:8080/courses/n8n/
- **Health Check**: http://localhost:8080/health

### Demo Credentials

- **Email**: `demo@learningplatform.com`
- **Password**: `demo123`

## 🔒 Security Features

### HTTP Security Headers

```nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Access Controls

- Hidden files (`.env`, `.git`) are blocked
- Sensitive file types are restricted
- Directory browsing is disabled

### Performance Optimizations

- **Gzip Compression**: Enabled for text assets
- **Static Asset Caching**: 1-year cache for images/fonts
- **Resource Optimization**: Minimized Docker layers

## 🚀 Production Deployment

### Recommended Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  learning-platform:
    image: learning-platform:latest
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - ENVIRONMENT=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`yourdomain.com`)"
```

### Scaling Options

```bash
# Scale with multiple replicas
docker-compose up -d --scale learning-platform=3

# Use with load balancer
# Add nginx/traefik in front of containers
```

## 🔍 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the port
sudo lsof -i :8080

# Use different port
./scripts/docker-run.sh 9000
```

**Container Won't Start**
```bash
# Check container logs
docker logs learning-platform-web

# Inspect container
docker inspect learning-platform-web
```

**Build Failures**
```bash
# Clean build
docker build --no-cache -t learning-platform .

# Check Docker disk space
docker system df
docker system prune
```

### Health Check Debugging

```bash
# Manual health check
curl http://localhost:8080/health

# Container health status
docker inspect --format='{{.State.Health.Status}}' learning-platform-web
```

## 📊 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats learning-platform-web

# Resource usage
docker exec learning-platform-web top
```

### Log Management

```bash
# Follow logs
docker logs -f learning-platform-web

# Last 100 lines
docker logs --tail 100 learning-platform-web

# Logs with timestamps
docker logs -t learning-platform-web
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Rebuild image
./scripts/docker-build.sh

# Restart with new image
docker-compose up -d --force-recreate
```

### Backup and Restore

```bash
# Export container
docker export learning-platform-web > learning-platform-backup.tar

# Import container
docker import learning-platform-backup.tar learning-platform:backup
```

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes locally with `docker-compose up`
2. Verify health checks work: `curl http://localhost:8080/health`
3. Check security headers: `curl -I http://localhost:8080`
4. Test error pages: `curl http://localhost:8080/nonexistent`
5. Validate build process: `./scripts/docker-build.sh test`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Container Security Best Practices](https://docs.docker.com/develop/security/) 