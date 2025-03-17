import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Create a Registry to register the metrics
export const register = new Registry();

// Add default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Define custom metrics
// HTTP request counter
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request duration histogram
export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

// Database operations counter
export const dbOperationsTotal = new Counter({
  name: 'db_operations_total',
  help: 'Total number of database operations',
  labelNames: ['operation', 'model'],
  registers: [register],
});

// Error counter
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type'],
  registers: [register],
});

// Middleware to measure HTTP request duration
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Record end time and increment metrics on response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Increment request counter
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    
    // Record request duration
    httpRequestDurationSeconds.observe(
      { method, route, status_code: statusCode },
      duration
    );
    
    // Log request for debugging
    logger.debug(
      `${method} ${route} ${statusCode} - ${duration.toFixed(3)}s`
    );
  });
  
  next();
};

// Metrics endpoint handler
export const metricsEndpoint = async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error(`Error generating metrics: ${error}`);
    res.status(500).send('Error generating metrics');
  }
};

// Export register for use in other files
export default register; 