# Notification Service

This service handles all notification-related functionality for the Church Planner application, including:

- Email notifications
- SMS notifications
- Push notifications
- In-app notifications
- User notification preferences
- Notification templates

## Features

- **Multiple Notification Channels**: Support for email, SMS, push, and in-app notifications
- **Templating System**: Customizable notification templates with variable substitution
- **User Preferences**: Fine-grained control over notification preferences
- **Digest Support**: Option to aggregate notifications into daily, weekly, or monthly digests
- **Push Device Management**: Register and manage device tokens for push notifications

## API Routes

### Notification Management

- `GET /api/notifications/user/:userId` - Get all notifications for a user
- `POST /api/notifications/user/:userId/read-all` - Mark all notifications as read for a user
- `GET /api/notifications/:id` - Get a single notification
- `PUT /api/notifications/:id` - Update a notification (admin only)
- `DELETE /api/notifications/:id` - Delete a notification
- `POST /api/notifications/:id/read` - Mark a notification as read
- `POST /api/notifications` - Create a new notification

### Template Management

- `GET /api/templates` - Get all notification templates
- `POST /api/templates` - Create a new notification template
- `GET /api/templates/:id` - Get a single template
- `PUT /api/templates/:id` - Update a template
- `DELETE /api/templates/:id` - Delete a template
- `POST /api/templates/:id/render` - Render a template with provided data

### Preference Management

- `GET /api/preferences/user/:userId` - Get a user's notification preferences
- `PUT /api/preferences/user/:userId` - Update a user's notification preferences
- `PUT /api/preferences/user/:userId/category/:category` - Update a specific category preference
- `POST /api/preferences/user/:userId/device` - Add a device token for push notifications
- `DELETE /api/preferences/user/:userId/device/:deviceId` - Remove a device token

## Configuration

The service can be configured using environment variables:

```env
# Server
NODE_ENV=development
PORT=3005
LOG_LEVEL=debug

# MongoDB
MONGO_URI=mongodb://localhost:27017/church-planner-notifications

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# Email settings
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@churchplanner.com
EMAIL_REPLY_TO=support@churchplanner.com

# SMS settings (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Push notifications
PUSH_ENABLED=true
FIREBASE_CREDENTIALS=your-firebase-credentials-json

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
CHURCH_SERVICE_URL=http://localhost:3002
MEMBER_SERVICE_URL=http://localhost:3003
EVENT_SERVICE_URL=http://localhost:3004

# CORS
CORS_ORIGIN=http://localhost:3000

# Notification settings
DEFAULT_NOTIFICATION_TTL=7
NOTIFICATION_BATCH_SIZE=50
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=300
```

## Running the Service

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm install
npm run build
npm start
```

### Docker

```bash
docker build -t notification-service .
docker run -p 3005:3005 --env-file .env notification-service
```

## Implementation Details

### Email Notifications

Email notifications are sent using Nodemailer. Templates can include both text and HTML versions.

### SMS Notifications

SMS notifications are sent using Twilio (configurable to use other providers).

### Push Notifications

Push notifications are sent using Firebase Cloud Messaging (configurable).

### In-App Notifications

In-app notifications are stored in the database and retrieved by the client application.

### Notification Templates

Templates support variable substitution using `{{variableName}}` syntax. Variables can be extracted and validated before sending. 