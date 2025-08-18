# 🚀 MUI Beta Application - Deployment Guide

This guide covers containerizing and deploying the MUI Beta Next.js application using Docker, Kubernetes, and various deployment strategies.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring and Observability](#monitoring-and-observability)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🛠 Prerequisites

### Required Software
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18+ or v20+)
- **kubectl** (for Kubernetes deployment)
- **Helm** (optional, for Kubernetes package management)

### Development Tools (Optional)
- **Trivy** (for security scanning)
- **k9s** (for Kubernetes cluster management)
- **Docker Desktop** (for local development)

## 🏠 Local Development

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mui-beta
   ```

2. **Start development environment**
   ```bash
   # Start development with hot reload
   docker-compose --profile development up app-dev

   # Or start production build locally
   docker-compose up app
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - Health Check: http://localhost:3000/api/health
   - Metrics: http://localhost:3000/api/metrics

### Development with Monitoring

```bash
# Start app with monitoring stack
docker-compose --profile monitoring up
```

Access monitoring:
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🏭 Production Build

### Using Build Script

```bash
# Make script executable
chmod +x scripts/build.sh

# Build production image
./scripts/build.sh

# Build with custom parameters
IMAGE_TAG=v1.0.0 REGISTRY=ghcr.io/username PUSH_TO_REGISTRY=true ./scripts/build.sh
```

### Manual Docker Build

```bash
# Build production image
docker build -t mui-beta:latest .

# Build development image
docker build -f Dockerfile.dev -t mui-beta:dev .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t mui-beta:latest --push .
```

## 🐳 Docker Deployment

### Simple Docker Run

```bash
# Run production container
docker run -d \
  --name mui-beta-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  mui-beta:latest

# Run with environment file
docker run -d \
  --name mui-beta-app \
  -p 3000:3000 \
  --env-file .env.production \
  mui-beta:latest
```

### Docker Compose Deployment

```bash
# Production deployment
docker-compose up -d app nginx

# With monitoring
docker-compose --profile monitoring up -d

# Scale the application
docker-compose up -d --scale app=3
```

### Production with Nginx

```bash
# Start with reverse proxy
docker-compose --profile production up -d
```

## ☸️ Kubernetes Deployment

### Prerequisites

1. **Create namespace**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Create secrets (if needed)**
   ```bash
   kubectl create secret generic mui-beta-secrets \
     --from-env-file=.env.production \
     --namespace=mui-beta
   ```

### Basic Deployment

```bash
# Deploy application
kubectl apply -f k8s/deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Deploy autoscaling
kubectl apply -f k8s/hpa.yaml
```

### Complete Deployment

```bash
# Deploy all resources
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n mui-beta
kubectl get services -n mui-beta
kubectl get ingress -n mui-beta
```

### Helm Deployment (Alternative)

```bash
# Install using Helm
helm install mui-beta ./helm-chart \
  --namespace mui-beta \
  --create-namespace \
  --values values.production.yaml
```

## 📊 Monitoring and Observability

### Health Checks

- **Liveness Probe**: `/api/health`
- **Readiness Probe**: `/api/health`
- **Metrics Endpoint**: `/api/metrics`

### Prometheus Metrics

The application exposes the following metrics:
- `nextjs_http_requests_total` - Total HTTP requests
- `nextjs_http_errors_total` - Total HTTP errors
- `nextjs_uptime_seconds` - Application uptime
- `nextjs_memory_usage_bytes` - Memory usage
- `nextjs_cpu_usage_seconds` - CPU usage

### Grafana Dashboards

Import dashboards for:
- Application performance
- Infrastructure metrics
- Business metrics
- Error tracking

## 🔄 CI/CD Pipeline

### GitHub Actions

The repository includes a complete CI/CD pipeline:

1. **Code Quality**: Linting, testing, coverage
2. **Security**: Vulnerability scanning with Trivy
3. **Build**: Multi-platform Docker images
4. **Deploy**: Automatic deployment to dev/prod

### Pipeline Triggers

- **Pull Requests**: Run tests and security scans
- **Main Branch**: Deploy to production
- **Develop Branch**: Deploy to development
- **Tags**: Release deployment

### Environment Variables

Configure these secrets in your CI/CD platform:

```bash
GITHUB_TOKEN          # For container registry
CODECOV_TOKEN         # For code coverage
KUBECONFIG           # For Kubernetes deployment
REGISTRY_USERNAME    # Container registry username
REGISTRY_PASSWORD    # Container registry password
```

## 🔒 Security Considerations

### Container Security

1. **Non-root user**: Application runs as user ID 1001
2. **Read-only filesystem**: Root filesystem is read-only
3. **Minimal attack surface**: Alpine-based images
4. **Security scanning**: Automated vulnerability scans

### Network Security

1. **TLS encryption**: HTTPS only in production
2. **Security headers**: CSP, HSTS, X-Frame-Options
3. **Rate limiting**: Request throttling
4. **CORS configuration**: Restricted origins

### Secrets Management

1. **Environment variables**: Use secure injection
2. **Kubernetes secrets**: For sensitive data
3. **Vault integration**: For advanced secret management
4. **Rotation policies**: Regular secret updates

## ⚡ Performance Optimization

### Image Optimization

1. **Multi-stage builds**: Minimal production images
2. **Layer caching**: Optimized build order
3. **Platform-specific**: ARM64 and AMD64 support
4. **Compression**: Optimized asset delivery

### Runtime Optimization

1. **Resource limits**: CPU and memory constraints
2. **Horizontal scaling**: Automatic pod scaling
3. **Caching strategies**: Redis integration ready
4. **CDN integration**: Static asset delivery

### Monitoring Performance

1. **Response times**: Track API latency
2. **Memory usage**: Monitor heap utilization
3. **CPU utilization**: Track processing efficiency
4. **Error rates**: Monitor application health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Application port | `3000` | No |
| `HOSTNAME` | Bind hostname | `0.0.0.0` | No |
| `API_BASE_URL` | External API URL | `https://dummyjson.com` | No |

### Resource Requirements

#### Minimum Requirements
- **CPU**: 250m
- **Memory**: 256Mi
- **Storage**: 1Gi

#### Recommended for Production
- **CPU**: 500m
- **Memory**: 512Mi
- **Storage**: 2Gi

## 🐛 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs mui-beta-app

# Check health endpoint
curl http://localhost:3000/api/health
```

#### High Memory Usage
```bash
# Monitor memory in real-time
docker stats mui-beta-app

# Check for memory leaks
kubectl top pods -n mui-beta
```

#### Build Failures
```bash
# Clear build cache
docker builder prune

# Build with no cache
docker build --no-cache -t mui-beta:latest .
```

### Debug Mode

```bash
# Run with debug logging
docker run -d \
  -e NODE_ENV=development \
  -e DEBUG=* \
  mui-beta:latest
```

### Kubernetes Debugging

```bash
# Check pod status
kubectl describe pod <pod-name> -n mui-beta

# View logs
kubectl logs <pod-name> -n mui-beta

# Shell into container
kubectl exec -it <pod-name> -n mui-beta -- sh
```

## 📝 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Kubernetes Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Container Security Guidelines](https://kubernetes.io/docs/concepts/security/)

## 🆘 Support

For deployment issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Verify environment configuration
4. Check resource constraints
5. Open an issue with detailed information

---

**Made with ❤️ for containerized deployments**