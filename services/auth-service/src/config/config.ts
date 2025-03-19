import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration for the Auth Service
 */
const config = {
  // Server settings
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database settings
  mongoUri: process.env.MONGO_URI || 'mongodb://auth-db:27017/auth',
  
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  jwtExpire: process.env.JWT_EXPIRE || '15m', // Shorter lifetime for access tokens
  jwtAudience: process.env.JWT_AUDIENCE || 'church-planner-api',
  jwtIssuer: process.env.JWT_ISSUER || 'church-planner',
  
  // Refresh token settings
  refreshSecret: process.env.REFRESH_SECRET || 'refresh_dev_secret',
  refreshExpire: process.env.REFRESH_EXPIRE || '7d', // 7 days
  
  // Service name for logging
  serviceName: process.env.SERVICE_NAME || 'auth-service',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // API Gateway URL (for service-to-service communication)
  apiGatewayUrl: process.env.API_GATEWAY_URL || 'http://api-gateway:8000',
  
  // Security settings
  passwordSaltRounds: 10,
  maxLoginAttempts: 5,
  lockTime: 15 * 60 * 1000, // 15 minutes in milliseconds
  
  // Password complexity requirements
  passwordComplexity: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true
  },
  
  // Token blacklist time-to-live (for revoked tokens)
  tokenBlacklistTTL: 24 * 60 * 60, // 24 hours in seconds
  
  // CORS settings
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
};

export default config; 