/**
 * Configuration for the Notification Service
 */
const config = {
  serviceName: 'notification-service',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3005', 10),
  
  // MongoDB connection
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/church-planner-notifications',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  
  // JWT for authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'notification-service-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/notification-service.log',
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@churchplanner.com',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@churchplanner.com',
  },
  
  // SMS configuration (can be extended for various providers)
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    from: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  // Push notification configuration
  push: {
    enabled: process.env.PUSH_ENABLED === 'true',
    firebaseCredentials: process.env.FIREBASE_CREDENTIALS || '',
  },
  
  // API endpoints for other services
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    church: process.env.CHURCH_SERVICE_URL || 'http://localhost:3002',
    member: process.env.MEMBER_SERVICE_URL || 'http://localhost:3003',
    events: process.env.EVENT_SERVICE_URL || 'http://localhost:3004',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // Notification defaults
  notifications: {
    defaultTTL: parseInt(process.env.DEFAULT_NOTIFICATION_TTL || '7', 10), // Days to keep notifications
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '50', 10),
    retryAttempts: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.NOTIFICATION_RETRY_DELAY || '300', 10), // seconds
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

export default config; 