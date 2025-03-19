import rateLimit from 'express-rate-limit';
import config from '../config/config';
import logger from '../utils/logger';

/**
 * Rate limiting middleware to protect against brute force attacks
 * 
 * This limits the number of requests a client can make within a specified time window
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
  skipSuccessfulRequests: false, // Don't skip successful requests
  keyGenerator: (req) => {
    // Use the client's IP address as the key
    return req.ip;
  }
});

/**
 * More restrictive rate limiting for authentication-related endpoints
 * This helps protect against brute force attacks on authentication
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Authentication rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use the client's IP address as the key
    return req.ip;
  }
}); 