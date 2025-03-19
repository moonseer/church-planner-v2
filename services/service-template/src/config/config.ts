import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration object
const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/service-template',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  
  // Services - URLs for other microservices this service might need to communicate with
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  
  // Redis cache
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // RabbitMQ
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  
  // Cors
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // 100 requests per windowMs
  }
};

export default config; 