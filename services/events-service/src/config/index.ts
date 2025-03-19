import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'events-service',
  port: parseInt(process.env.PORT || '3004', 10),
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/events-service',
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
  memberService: {
    url: process.env.MEMBER_SERVICE_URL || 'http://localhost:3003',
  },
  churchService: {
    url: process.env.CHURCH_SERVICE_URL || 'http://localhost:3002',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchangeName: process.env.RABBITMQ_EXCHANGE_NAME || 'church_planner_events',
    queueName: process.env.RABBITMQ_QUEUE_NAME || 'events_service_queue',
  },
  timezones: {
    default: process.env.DEFAULT_TIMEZONE || 'UTC',
  },
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGINATION_LIMIT || '10', 10),
    maxLimit: parseInt(process.env.MAX_PAGINATION_LIMIT || '100', 10),
  },
};

export default config; 