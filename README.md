# Church Planner v2

A comprehensive church planning and management application built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- Calendar and event management
- Service planning
- Team management
- Volunteer scheduling
- Song library
- Reporting and analytics
- Comprehensive monitoring and observability

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- ESLint and Prettier for code quality

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication

### Monitoring & Observability
- Prometheus for metrics collection
- Grafana for metrics visualization
- Loki for log aggregation
- Promtail for log collection
- Custom metrics for application performance monitoring

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for MongoDB)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/church-planner-v2.git
   cd church-planner-v2
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start MongoDB using Docker:
   ```bash
   docker-compose up -d
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

This will start both the client (on port 5173) and the server (on port 4000).

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the server directory with the following variables:

```
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://admin:password@localhost:27017/church-planner?authSource=admin
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
```

## Project Setup Validation

The project includes a comprehensive validation script that checks if all the required setup steps have been completed correctly and tests the API endpoints. This is useful for ensuring that your development environment is properly configured and that the API is functioning as expected.

### Running the Validation Script

```bash
# Install required dependencies for the validation script
npm install dotenv mongoose

# Make the script executable
chmod +x project_setup.js

# Start the server (required for API endpoint testing)
npm run server

# In a separate terminal, run the validation script
npm run validate-setup
```

### What the Validation Script Checks

#### Project Setup
- Project structure (client and server directories)
- Client setup (package.json, Vite, Tailwind CSS, Prettier)
- Server setup (package.json, TypeScript, environment variables, .gitignore)
- Dependencies (React, Tailwind CSS, Express, Mongoose, JWT)
- Docker and MongoDB (Docker Compose, Docker running, MongoDB container)
- MongoDB connection

#### API Endpoint Testing
The script performs a complete CRUD (Create, Read, Update, Delete) test on the Church API endpoints:

1. **GET /api/churches** - Tests retrieving all churches (public access)
2. **POST /api/churches** - Tests creating a new church with test data (admin access only)
3. **GET /api/churches/:id** - Tests retrieving a specific church by ID (public access)
4. **PUT /api/churches/:id** - Tests updating a church's information (admin access only)
5. **DELETE /api/churches/:id** - Tests deleting a church (admin access only)

For protected endpoints (POST, PUT, DELETE), the script first authenticates as an admin user to obtain a JWT token, which is then included in the requests to these endpoints.

#### JWT Authentication Testing
The script also tests the JWT authentication system:

1. **POST /api/auth/register** - Tests user registration with a unique test email
2. **POST /api/auth/login** - Tests user login with the created credentials
3. **GET /api/auth/me** - Tests retrieving the current user using JWT authentication (protected route)

This ensures that the authentication system is properly configured and working, including token generation, validation, and protected route access.

### Validation Output

The script will output a detailed summary of all checks performed, with color-coded results:
- ✓ Green for passed checks
- ✗ Red for failed checks
- ⚠ Yellow for warnings
- ℹ Blue for informational messages

At the end, you'll see a summary showing the percentage of checks that passed, helping you identify any missing components or issues in your setup.

## API Endpoints

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
  - Public access
  - Required fields: name, email, password, churchName
  - Optional fields: churchAddress, churchCity, churchState, churchZip
  - Returns: JWT token and user data

- **POST /api/auth/login** - Login a user
  - Public access
  - Required fields: email, password
  - Returns: JWT token and user data

- **GET /api/auth/me** - Get current user
  - Protected route (requires authentication)
  - Returns: User data including church information

### Church Endpoints

- **GET /api/churches** - Get all churches
  - Public access
  - Returns: List of churches

- **POST /api/churches** - Create a new church
  - Protected route (requires admin role)
  - Required fields: name
  - Optional fields: address, city, state, zip, phone, email, website
  - Returns: Created church data

- **GET /api/churches/:id** - Get a specific church
  - Public access
  - Returns: Church data

- **PUT /api/churches/:id** - Update a church
  - Protected route (requires admin role)
  - Returns: Updated church data

- **DELETE /api/churches/:id** - Delete a church
  - Protected route (requires admin role)
  - Returns: Success message

### Event Type Endpoints

- **GET /api/event-types** - Get all event types for the user's church
  - Protected route (requires authentication)
  - Returns: List of event types

- **POST /api/event-types** - Create a new event type
  - Protected route (requires authentication)
  - Required fields: name, color
  - Optional fields: description
  - Returns: Created event type data

- **GET /api/event-types/:id** - Get a specific event type
  - Protected route (requires authentication)
  - Returns: Event type data

- **PUT /api/event-types/:id** - Update an event type
  - Protected route (requires authentication)
  - Returns: Updated event type data

- **DELETE /api/event-types/:id** - Delete an event type
  - Protected route (requires authentication)
  - Returns: Success message

### Event Endpoints

- **GET /api/events** - Get all events for the user's church
  - Protected route (requires authentication)
  - Query parameters: start, end (for date range filtering)
  - Returns: List of events

- **POST /api/events** - Create a new event
  - Protected route (requires authentication)
  - Required fields: title, start, end, eventType
  - Optional fields: description, location, allDay
  - Returns: Created event data

- **GET /api/events/:id** - Get a specific event
  - Protected route (requires authentication)
  - Returns: Event data

- **PUT /api/events/:id** - Update an event
  - Protected route (requires authentication)
  - Returns: Updated event data

- **DELETE /api/events/:id** - Delete an event
  - Protected route (requires authentication)
  - Returns: Success message

### Team Endpoints

- **GET /api/teams** - Get all teams for the user's church
  - Protected route (requires authentication)
  - Returns: List of teams with leader information

- **POST /api/teams** - Create a new team
  - Protected route (requires authentication)
  - Required fields: name, church
  - Optional fields: description, leader
  - Returns: Created team data

- **GET /api/teams/:id** - Get a specific team
  - Protected route (requires authentication)
  - Returns: Team data with leader information

- **PUT /api/teams/:id** - Update a team
  - Protected route (requires authentication)
  - Returns: Updated team data

- **DELETE /api/teams/:id** - Delete a team
  - Protected route (requires authentication)
  - Returns: Success message

### Team Member Endpoints

- **GET /api/teams/:teamId/members** - Get all members for a specific team
  - Protected route (requires authentication)
  - Returns: List of team members with user information

- **POST /api/teams/:teamId/members** - Add a member to a team
  - Protected route (requires authentication)
  - Required fields: user
  - Optional fields: role, status
  - Returns: Created team member data

- **GET /api/team-members/:id** - Get a specific team member
  - Protected route (requires authentication)
  - Returns: Team member data with user and team information

- **PUT /api/team-members/:id** - Update a team member
  - Protected route (requires authentication)
  - Optional fields: role, status
  - Returns: Updated team member data

- **DELETE /api/team-members/:id** - Remove a member from a team
  - Protected route (requires authentication)
  - Returns: Success message

### Service Endpoints

- **GET /api/services** - Get all services for the user's church
  - Protected route (requires authentication)
  - Query parameters: startDate, endDate (for date range filtering)
  - Returns: List of services with event information

- **POST /api/services** - Create a new service
  - Protected route (requires authentication)
  - Required fields: title, date, church
  - Optional fields: description, event, items
  - Returns: Created service data

- **GET /api/services/:id** - Get a specific service
  - Protected route (requires authentication)
  - Returns: Service data with event and item information

- **PUT /api/services/:id** - Update a service
  - Protected route (requires authentication)
  - Returns: Updated service data

- **DELETE /api/services/:id** - Delete a service
  - Protected route (requires authentication)
  - Returns: Success message

## Project Structure

```
church-planner-v2/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── server/                 # Backend Node.js application
│   ├── src/                # Source code
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Root package.json for scripts
├── project_setup.js        # Project setup validation script
└── README.md               # Project documentation
```

## Development

### Running the Application

- `npm run dev`: Start both client and server in development mode
- `npm run client`: Start only the client
- `npm run server`: Start only the server

### Building for Production

```bash
npm run build
```

This will build both the client and server applications.

### Starting in Production

```bash
npm start
```

This will start the server in production mode, serving the built client files.

## MongoDB Admin Interface

The MongoDB Express admin interface is available at http://localhost:8081 when running the Docker Compose setup.

- Username: admin
- Password: password

## API Documentation

The Church Planner application provides comprehensive API documentation using Swagger/OpenAPI. This makes it easy to explore and test the available endpoints.

### Accessing the API Documentation

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8080/api/docs
   ```

3. You'll see the Swagger UI interface where you can:
   - Browse all available endpoints organized by tags
   - See request parameters, body schemas, and response formats
   - Test endpoints directly from the browser
   - View models and data structures
   - Authenticate using JWT tokens via the "Authorize" button

### Available API Endpoints

The following API endpoints are documented with Swagger:

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token
- `GET /api/auth/me` - Get current user information

#### Churches
- `GET /api/churches` - Get all churches
- `POST /api/churches` - Create a new church (admin only)
- `GET /api/churches/:id` - Get a specific church
- `PUT /api/churches/:id` - Update a church (admin only)
- `DELETE /api/churches/:id` - Delete a church (admin only)

#### Event Types
- `GET /api/event-types` - Get all event types
- `POST /api/event-types` - Create a new event type
- `GET /api/event-types/:id` - Get a specific event type
- `PUT /api/event-types/:id` - Update an event type
- `DELETE /api/event-types/:id` - Delete an event type

#### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get a specific event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

#### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create a new team
- `GET /api/teams/:id` - Get a specific team
- `PUT /api/teams/:id` - Update a team
- `DELETE /api/teams/:id` - Delete a team

#### Team Members
- `GET /api/teams/:teamId/members` - Get all members of a team
- `POST /api/teams/:teamId/members` - Add a member to a team
- `GET /api/teams/:teamId/members/:id` - Get a specific team member
- `PUT /api/teams/:teamId/members/:id` - Update a team member
- `DELETE /api/teams/:teamId/members/:id` - Remove a member from a team

#### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create a new service
- `GET /api/services/:id` - Get a specific service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Authentication

Most API endpoints require authentication. To authenticate:

1. Register a user or login to get a JWT token
2. Include the token in the Authorization header of your requests:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

In the Swagger UI, you can click the "Authorize" button and enter your token to authenticate all requests.

### Known Issues

The Swagger documentation currently has TypeScript linter errors related to the return types in the controller functions. These errors don't affect the functionality of the API or the documentation, but they should be addressed in future updates to improve code quality.

The main error pattern is:
```
Type 'Promise<Response<any, Record<string, any>> | undefined>' is not assignable to type 'void | Promise<void>'
```

This occurs because the Express route handlers expect functions that return void or Promise<void>, but our controller functions are returning Response objects.

## CI/CD Pipeline

The Church Planner application uses GitHub Actions for continuous integration and continuous deployment. The CI/CD pipeline automates testing, building, and (in the future) deploying the application.

### Workflows

- **Main Workflow**: Runs tests and builds the application
- **API Validation**: Validates the API endpoints using the project_setup.js script
- **Code Quality**: Performs linting, type checking, and other code quality checks

### Running Tests Locally

Before pushing your changes, you can run the same checks that the CI pipeline will run:

```bash
# Install dependencies
npm ci
cd client && npm ci
cd ../server && npm ci

# Run linting
cd client && npm run lint
cd ../server && npm run lint

# Run type checking
cd client && npm run typecheck
cd ../server && npm run typecheck

# Run tests
cd client && npm test
cd ../server && npm test

# Build the application
npm run build
```

For more details about the CI/CD pipeline, see the deployment section in [Progress](docs/progress.md).

## License

[MIT](LICENSE)

## Documentation

- [API Documentation](docs/api-docs-tasks.md)
- [Environment Configuration](docs/ENVIRONMENTS.md)
- [Docker Setup](docs/DOCKER_SETUP.md)
- [Code Quality](docs/CODE_QUALITY.md)
- [Test Coverage](docs/TEST_COVERAGE.md)
- [Error Tracking](docs/ERROR_TRACKING.md)
- [Logging](docs/LOGGING.md)
- [Monitoring](docs/MONITORING.md)
- [Security](docs/SECURITY.md)
- [Password Policy](docs/PASSWORD_POLICY.md)
- [Type Safety](docs/TYPE_SAFETY.md)
- [Progress](docs/progress.md)

## Monitoring

The application includes a comprehensive monitoring and observability stack:

### Metrics Collection

- Server-side metrics using Prometheus
- Client-side performance monitoring
- Database operation tracking
- Error tracking and monitoring

### Monitoring Tools

- **Prometheus**: http://localhost:9090 (when running with Docker)
- **Grafana**: http://localhost:3030 (when running with Docker)
  - Default credentials: admin/admin

### Documentation

For more details on the monitoring setup, see the [Monitoring Documentation](docs/MONITORING.md).