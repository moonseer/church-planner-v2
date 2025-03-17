# Monitoring and Observability

This document describes the monitoring and observability infrastructure for the Church Planner application.

## Overview

The Church Planner application uses a comprehensive monitoring stack to track application performance, errors, and user experience. The monitoring infrastructure consists of:

- **Prometheus**: For metrics collection and storage
- **Grafana**: For metrics visualization and dashboards
- **Loki**: For log aggregation and querying
- **Promtail**: For log collection from containers

## Metrics Collection

### Server-Side Metrics

The server application exposes the following metrics:

1. **HTTP Request Metrics**:
   - `http_requests_total`: Counter for total HTTP requests with labels for method, route, and status code
   - `http_request_duration_seconds`: Histogram for HTTP request duration

2. **Database Operation Metrics**:
   - `db_operations_total`: Counter for database operations with labels for operation type and model

3. **Error Metrics**:
   - `errors_total`: Counter for application errors with labels for error type

4. **System Metrics**:
   - Default Node.js metrics (CPU, memory, event loop, etc.)

### Client-Side Metrics

The client application collects the following performance metrics:

1. **Page Load Metrics**:
   - Page load time
   - DOM content loaded time

2. **Web Vitals**:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)

## Monitoring Setup

### Docker Compose Configuration

The monitoring stack is configured in the `docker-compose.yml` file and includes:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    networks:
      - app-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"
    networks:
      - app-network
    depends_on:
      - prometheus
      - loki

  loki:
    image: grafana/loki:latest
    volumes:
      - ./monitoring/loki/local-config.yaml:/etc/loki/local-config.yaml
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - app-network

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./monitoring/promtail/config.yml:/etc/promtail/config.yml
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    networks:
      - app-network
    depends_on:
      - loki
```

### Accessing Monitoring Tools

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (default credentials: admin/admin)
- **Loki**: http://localhost:3100 (accessed through Grafana)

## Metrics Implementation

### Server-Side Metrics

The server application uses the `prom-client` library to collect and expose metrics:

```typescript
// server/src/utils/metrics.ts
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

// Create a registry to register metrics
export const register = new Registry();

// Add default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Define custom metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// ... other metrics
```

### Database Monitoring

Database operations are monitored using Mongoose middleware:

```typescript
// server/src/utils/dbMonitoring.ts
import mongoose from 'mongoose';
import { dbOperationsTotal } from './metrics';

export const setupDbMonitoring = () => {
  // Add middleware for database operations
  mongoose.plugin(schema => {
    // Pre/post middleware for various operations
    // ...
  });
};
```

### Error Tracking

Errors are tracked using the error handler middleware:

```typescript
// server/src/utils/errorHandler.ts
import { errorsTotal } from './metrics';

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Track error in Prometheus metrics
  errorsTotal.inc({ type: err.name || 'UnknownError' });
  
  // ... error handling logic
};
```

### Client-Side Monitoring

Client-side performance is monitored using a custom React hook:

```typescript
// client/src/utils/monitoring.ts
export function usePerformanceMonitoring(): void {
  useEffect(() => {
    // Set up performance observers for web vitals
    // ...
    
    // Report metrics to the server
    // ...
  }, []);
}
```

## Dashboards

The monitoring setup includes pre-configured Grafana dashboards for:

1. **Application Overview**: Key metrics for the entire application
2. **HTTP Requests**: Detailed view of HTTP request metrics
3. **Database Operations**: Monitoring of database performance
4. **Error Tracking**: Visualization of application errors
5. **Client Performance**: Web vitals and user experience metrics

## Alerting

Alerts are configured in Grafana for critical conditions:

1. **High Error Rate**: Triggered when error rate exceeds threshold
2. **Slow Response Time**: Triggered when HTTP requests are consistently slow
3. **Database Issues**: Triggered when database operations fail or are slow
4. **Memory Usage**: Triggered when memory usage is high

## Best Practices

1. **Metric Naming**: Follow the Prometheus naming conventions
2. **Label Cardinality**: Avoid high cardinality labels
3. **Metric Types**: Use appropriate metric types (counter, gauge, histogram)
4. **Dashboard Organization**: Organize dashboards by functional area
5. **Alert Thresholds**: Set appropriate thresholds to avoid alert fatigue

## Troubleshooting

### Common Issues

1. **Prometheus Not Scraping Metrics**:
   - Check the Prometheus configuration
   - Verify the metrics endpoint is accessible

2. **Missing Logs in Loki**:
   - Check Promtail configuration
   - Verify Docker labels are correctly set

3. **Grafana Dashboard Issues**:
   - Check data source configuration
   - Verify query syntax

## Future Improvements

1. **Distributed Tracing**: Implement OpenTelemetry for distributed tracing
2. **Custom Alerting Rules**: Develop more sophisticated alerting rules
3. **User Experience Monitoring**: Expand client-side monitoring
4. **Business Metrics**: Add metrics for business KPIs
5. **Automated Remediation**: Implement automated responses to common issues 