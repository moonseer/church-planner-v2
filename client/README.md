# Church Planner Client

This is the frontend for the Church Planner application, built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (login, register, password reset)
- Church management dashboard
- Church member management
- Clean, modern UI with responsive design
- Form validations and error handling
- Role-based access control

## Project Structure

```
src/
├── components/       # Reusable UI components
├── features/         # Feature-specific components and logic
├── hooks/            # Custom React hooks
├── layouts/          # Page layout components
├── pages/            # Main page components
├── services/         # API services and data fetching
├── styles/           # Global styles and Tailwind config
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── App.tsx           # Main application component
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Development

Start the development server:

```
npm run dev
```

or

```
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application for production:

```
npm run build
```

or

```
yarn build
```

## Pages and Components

- **AuthLayout**: Layout for authentication pages
- **MainLayout**: Layout for authenticated pages
- **HomePage**: Landing page for visitors
- **Dashboard**: Main dashboard for authenticated users
- **ChurchListPage**: List of churches for the current user
- **ChurchMembersPage**: List and management of church members
- **NotFoundPage**: 404 page for invalid routes

## Integration with Backend

The client communicates with the backend API through services defined in the `services` directory. These services handle authentication, data fetching, and error handling.
