import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config/config';
import logger from '../utils/logger';

/**
 * Factory function that creates a proxy middleware for a specific service
 * @param serviceName The name of the service to proxy to
 * @param serviceUrl The URL of the service
 * @returns A proxy middleware function
 */
export const createServiceProxy = (
  serviceName: string,
  serviceUrl: string
) => {
  // Configure proxy options
  const options: Options = {
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^${config.apiPrefix}/${serviceName}`]: '',
    },
    logLevel: config.nodeEnv === 'development' ? 'debug' : 'info',
    logProvider: () => logger,
    timeout: config.timeouts.proxy,
    proxyTimeout: config.timeouts.proxy,
    onProxyReq: (proxyReq, req) => {
      // Preserve original request ID for tracing
      const requestId = req.headers['x-request-id'];
      if (requestId) {
        proxyReq.setHeader('x-request-id', requestId.toString());
      }
      
      // Log proxy request
      logger.debug(`Proxying request to ${serviceName} service: ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req) => {
      // Log proxy response
      logger.debug(`Received response from ${serviceName} service: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
      // Handle proxy errors
      logger.error(`Proxy error for ${serviceName} service: ${err.message}`);
      res.status(StatusCodes.BAD_GATEWAY).json({
        status: 'error',
        message: `Service ${serviceName} is currently unavailable. Please try again later.`,
        error: config.nodeEnv === 'development' ? err.message : undefined
      });
    }
  };

  return createProxyMiddleware(options);
};

/**
 * Configure service proxies for all microservices
 */
export const setupProxies = (app: any) => {
  // Auth service proxy
  app.use(
    `${config.apiPrefix}/auth`,
    createServiceProxy('auth', config.services.auth)
  );

  // Church service proxy
  app.use(
    `${config.apiPrefix}/churches`,
    createServiceProxy('churches', config.services.church)
  );

  // Member service proxy
  app.use(
    `${config.apiPrefix}/members`,
    createServiceProxy('members', config.services.member)
  );

  // Event service proxy
  app.use(
    `${config.apiPrefix}/events`,
    createServiceProxy('events', config.services.event)
  );
};

/**
 * Fallback middleware for handling undefined routes
 */
export const handleUndefinedRoutes = (req: Request, res: Response, _next: NextFunction) => {
  logger.warn(`Undefined route accessed: ${req.method} ${req.originalUrl}`);
  return res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: 'Requested resource not found'
  });
}; 