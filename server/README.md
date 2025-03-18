# Church Planner API

This is the backend API for the Church Planner application, built with Express, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- Church management (create, read, update, delete)
- Church member management
- Role-based access control
- Secure password reset and recovery
- Rate limiting for security
- Comprehensive error handling

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Middleware functions
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Church Routes

- `GET /api/churches` - Get all churches
- `POST /api/churches` - Create new church
- `GET /api/churches/:id` - Get single church
- `PUT /api/churches/:id` - Update church
- `DELETE /api/churches/:id` - Delete church
- `GET /api/churches/my-churches` - Get current user's churches
- `POST /api/churches/:id/members` - Add member to church
- `DELETE /api/churches/:id/members/:memberId` - Remove member from church
- `POST /api/churches/:id/admins` - Add admin to church
- `DELETE /api/churches/:id/admins/:adminId` - Remove admin from church

### Church Member Routes

- `GET /api/churches/:churchId/members` - Get all members for a church
- `POST /api/churches/:churchId/members` - Create new church member
- `GET /api/churches/:churchId/members/:id` - Get single church member
- `PUT /api/churches/:churchId/members/:id` - Update church member
- `DELETE /api/churches/:churchId/members/:id` - Delete church member
- `GET /api/churches/:churchId/members/stats` - Get member statistics
- `GET /api/churches/:churchId/members/search` - Search church members

## Security Measures

- XSS Protection
- Rate Limiting
- Parameter Pollution Prevention
- CORS
- Helmet Security Headers
- Data Sanitization
- Secure Cookie Settings

## Error Handling

The API uses a custom error handling middleware to provide consistent and informative error responses.

## Running the Server

1. Install dependencies: `npm install`
2. Set up environment variables (see .env.example)
3. Run in development mode: `npm run dev`
4. Build for production: `npm run build`
5. Run in production mode: `npm start`

## Environment Variables

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
``` 