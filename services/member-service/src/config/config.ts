import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  serviceName: string;
  mongoUri: string;
  apiGatewayUrl: string;
  churchServiceUrl: string;
  corsOrigin: string[];
  logLevel: string;
  jwtSecret: string;
  jwtAudience: string;
  jwtIssuer: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3003', 10),
  serviceName: process.env.SERVICE_NAME || 'member-service',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/member',
  apiGatewayUrl: process.env.API_GATEWAY_URL || 'http://localhost:8000',
  churchServiceUrl: process.env.CHURCH_SERVICE_URL || 'http://localhost:3002',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  logLevel: process.env.LOG_LEVEL || 'info',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  jwtAudience: process.env.JWT_AUDIENCE || 'church-planner-api',
  jwtIssuer: process.env.JWT_ISSUER || 'church-planner',
};

export default config; 