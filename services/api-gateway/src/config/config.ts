import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration object
const config = {
  // Server
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'api-gateway',
  
  // API Gateway specific settings
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  
  // Microservice URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    church: process.env.CHURCH_SERVICE_URL || 'http://church-service:3002',
    member: process.env.MEMBER_SERVICE_URL || 'http://member-service:3003',
    event: process.env.EVENT_SERVICE_URL || 'http://event-service:3004'
  },
  
  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    expiration: process.env.JWT_EXPIRES_IN || '1d',
    audience: process.env.JWT_AUDIENCE || 'church-planner-api',
    issuer: process.env.JWT_ISSUER || 'church-planner'
  },
  
  // Redis cache
  redis: {
    url: process.env.REDIS_URL || 'redis://redis:6379',
    ttl: parseInt(process.env.REDIS_CACHE_TTL || '3600', 10) // 1 hour in seconds
  },
  
  // Cors
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Timeouts
  timeouts: {
    proxy: parseInt(process.env.PROXY_TIMEOUT || '30000', 10), // 30 seconds
    socket: parseInt(process.env.SOCKET_TIMEOUT || '30000', 10)  // 30 seconds
  }
};

export default config; 