import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'member-service',
  port: parseInt(process.env.PORT || '3002', 10),
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/member-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expires: process.env.JWT_EXPIRE || '30d',
    audience: process.env.JWT_AUDIENCE || 'church-planner-api',
    issuer: process.env.JWT_ISSUER || 'church-planner',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  apiGateway: {
    url: process.env.API_GATEWAY_URL || 'http://localhost:8000',
  },
  security: {
    profilePictureMaxSize: parseInt(process.env.PROFILE_PICTURE_MAX_SIZE || '5242880', 10), // 5MB in bytes
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  },
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGINATION_LIMIT || '10', 10),
    maxLimit: parseInt(process.env.MAX_PAGINATION_LIMIT || '100', 10),
  },
};

export default config; 