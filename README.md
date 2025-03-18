# Church Planner

A full-stack web application for managing church congregations, members, and events.

## Overview

Church Planner is designed to help churches manage their congregations, members, events, and services. The application provides a clean, modern interface for church administrators to organize their church activities effectively.

## Key Features

- **User Authentication**: Secure registration, login, and password reset
- **Church Management**: Create and manage churches with detailed information
- **Member Management**: Add, update, and track church members
- **Role-Based Access Control**: Admin and user roles with different permissions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Architecture

This project is built using a modern full-stack architecture:

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Authentication**: JWT-based authentication

## Project Structure

```
/
├── client/             # Frontend application
├── server/             # Backend API
├── shared/             # Shared types and utilities
├── docs/               # Documentation
└── config/             # Configuration files
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- MongoDB (v4 or newer)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or run the install script for both client and server:
   ```
   npm run install:all
   ```

### Development

1. Start the development server:
   ```
   npm run dev
   ```
   This will start both the client and server in development mode.

2. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Production

1. Build the application for production:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## API Documentation

The API documentation is available at `/api/docs` when the server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc.