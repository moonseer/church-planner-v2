import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

// Define metrics types
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage?: number;
}

export interface CodeQualityMetrics {
  typeCoverageServer: number;
  typeCoverageClient: number;
  codeSmellCount: number;
  lintErrorsServer: number;
  lintErrorsClient: number;
}

export interface SystemMetrics {
  freeMemory: number;
  totalMemory: number;
  uptime: number;
}

// Setup loggers
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const metricsLogger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: {
      destination: path.join(process.cwd(), 'logs', 'metrics.log'),
      mkdir: true,
    },
  },
});

/**
 * Middleware to log request details and response time
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Add response finished listener to log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent') || 'unknown',
      ip: req.ip,
    };
    
    logger.info(log, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    
    // Log performance metrics
    const performanceMetrics: PerformanceMetrics = {
      responseTime: duration,
      memoryUsage: process.memoryUsage().heapUsed,
    };
    
    logPerformanceMetrics(performanceMetrics);
  });
  
  next();
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  metricsLogger.info({ type: 'performance', ...metrics });
}

/**
 * Log system metrics
 */
export function logSystemMetrics(): void {
  const metrics: SystemMetrics = {
    freeMemory: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
    totalMemory: process.memoryUsage().heapTotal,
    uptime: process.uptime(),
  };
  
  metricsLogger.info({ type: 'system', ...metrics });
}

/**
 * Read and log code quality metrics
 */
export async function logCodeQualityMetrics(): Promise<CodeQualityMetrics> {
  try {
    const readFileAsync = promisify(fs.readFile);
    
    // Read type coverage report
    const typeCoveragePath = path.join(process.cwd(), 'reports', 'type-coverage-summary.md');
    const typeSmellsPath = path.join(process.cwd(), 'reports', 'code-smells.md');
    
    let typeCoverageServer = 0;
    let typeCoverageClient = 0;
    let codeSmellCount = 0;
    
    try {
      const typeCoverageContent = await readFileAsync(typeCoveragePath, 'utf8');
      
      // Extract server type coverage
      const serverMatch = typeCoverageContent.match(/Server Type Coverage: (\d+\.\d+)%/);
      if (serverMatch && serverMatch[1]) {
        typeCoverageServer = parseFloat(serverMatch[1]);
      }
      
      // Extract client type coverage
      const clientMatch = typeCoverageContent.match(/Client Type Coverage: (\d+\.\d+)%/);
      if (clientMatch && clientMatch[1]) {
        typeCoverageClient = parseFloat(clientMatch[1]);
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to read type coverage report');
    }
    
    try {
      const codeSmellsContent = await readFileAsync(typeSmellsPath, 'utf8');
      
      // Extract code smell count
      const smellMatch = codeSmellsContent.match(/Found (\d+) potential code smells/);
      if (smellMatch && smellMatch[1]) {
        codeSmellCount = parseInt(smellMatch[1], 10);
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to read code smells report');
    }
    
    const metrics: CodeQualityMetrics = {
      typeCoverageServer,
      typeCoverageClient,
      codeSmellCount,
      lintErrorsServer: 0, // These would need to be extracted from ESLint reports
      lintErrorsClient: 0,
    };
    
    metricsLogger.info({ type: 'codeQuality', ...metrics });
    
    // Send to Prometheus if configured
    if (process.env.PROMETHEUS_ENABLED === 'true') {
      // Implementation would depend on your Prometheus client
      logger.info('Sending code quality metrics to Prometheus');
    }
    
    return metrics;
  } catch (err) {
    logger.error({ err }, 'Error logging code quality metrics');
    throw err;
  }
}

/**
 * Schedule regular system metrics logging
 */
export function scheduleMetricsLogging(intervalMs = 60000): NodeJS.Timeout {
  return setInterval(() => {
    logSystemMetrics();
    // Log code quality metrics once a day
    const hour = new Date().getHours();
    if (hour === 0) {
      logCodeQualityMetrics().catch(err => {
        logger.error({ err }, 'Failed to log code quality metrics in scheduled job');
      });
    }
  }, intervalMs);
}

// Export logger for use elsewhere
export { logger }; 