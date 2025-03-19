# Church Planner Microservices Implementation Plan

This document outlines the detailed implementation plan for transforming the Church Planner application from a monolithic architecture to a microservices architecture with comprehensive monitoring, logging, and visualization.

## Table of Contents

1. [Implementation Phases Overview](#implementation-phases-overview)
2. [Phase 1: Preparation and Infrastructure Setup](#phase-1-preparation-and-infrastructure-setup)
3. [Phase 2: API Gateway Implementation](#phase-2-api-gateway-implementation)
4. [Phase 3: Service Decomposition](#phase-3-service-decomposition)
5. [Phase 4: Monitoring and Observability](#phase-4-monitoring-and-observability)
6. [Phase 5: Testing and Validation](#phase-5-testing-and-validation)
7. [Phase 6: Production Readiness](#phase-6-production-readiness)
8. [Progress Tracking](#progress-tracking)

## Implementation Phases Overview

```
┌─────────────────────┐
│  Phase 1: Preparation  │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Phase 2: API Gateway  │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Phase 3: Decomposition │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Phase 4: Monitoring    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Phase 5: Testing     │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Phase 6: Production   │
└─────────────────────┘
```

## Phase 1: Preparation and Infrastructure Setup

**Goal**: Set up the foundation for microservices architecture without changing existing functionality.

### 1.1 Create New Directory Structure (Week 1, Day 1-2)

- [x] Create base services directories:
```bash
mkdir -p services/api-gateway
mkdir -p services/auth-service
mkdir -p services/church-service
mkdir -p services/member-service
mkdir -p services/events-service
```

- [x] Create infrastructure directories:
```bash
mkdir -p infrastructure/docker
mkdir -p infrastructure/monitoring
mkdir -p infrastructure/logging
```

### 1.2 Set Up Base Docker Compose Files (Week 1, Day 3-4)

- [x] Create base `docker-compose.yml` with common configurations
- [x] Create environment-specific overrides (`docker-compose.dev.yml`, `docker-compose.prod.yml`)
- [x] Configure network and volume setup

**File: `infrastructure/docker/docker-compose.yml`**
```yaml
version: '3.8'

networks:
  church-planner-network:
    driver: bridge

volumes:
  auth-db-data:
  church-db-data:
  member-db-data:
  events-db-data:
  redis-data:
  elasticsearch-data:
  prometheus-data:
  grafana-data:
```

### 1.3 Set Up Shared Libraries (Week 1, Day 5-7)

- [x] Review existing code for shareable components
- [x] Create shared TypeScript types, utilities, and constants
- [x] Implement common middleware and error handling

**Shared Library Structure:**
```
shared/
├── types/
│   ├── api.ts        # API request/response types
│   ├── auth.ts       # Authentication types
│   ├── models.ts     # Shared model interfaces
│   └── index.ts      # Exports
├── utils/
│   ├── error.ts      # Error handling utilities
│   ├── validation.ts # Data validation
│   └── logger.ts     # Logging utilities
└── constants/
    ├── statusCodes.ts # HTTP status codes
    └── messages.ts    # Error/success messages
```

### 1.4 Create Service Templates (Week 2, Day 1-2)

- [x] Create base service template with consistent structure
- [x] Include health check endpoints
- [x] Set up common service configurations

**Service Template Structure:**
```
service-template/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── Dockerfile.dev
├── package.json
├── tsconfig.json
└── healthcheck.js
```

## Phase 2: API Gateway Implementation

**Goal**: Implement an API Gateway to route requests to appropriate microservices.

**Status**: Phase 2 is 2/3 complete, with the API Gateway implementation and Docker Compose configuration finished. The client update is pending.

**Completed Tasks**:
- Created an API Gateway using Node.js and Express.js to serve as the entrypoint for all client requests
- Implemented service discovery and routing to direct requests to appropriate backend services
- Added JWT-based authentication to centralize security at the gateway level
- Configured rate limiting to protect against abuse and DoS attacks
- Set up logging with correlation IDs for request tracing across services
- Added health check endpoints for monitoring and container orchestration
- Generated Swagger documentation for API exploration and testing
- Updated Docker Compose files to integrate the API Gateway with other services
- Changed default port from 3000 to 8000 to avoid conflicts with existing services

**Implementation Highlights**:
- The API Gateway uses http-proxy-middleware for efficient request proxying
- Requests are routed based on path patterns to the appropriate backend service
- Health check endpoints verify connectivity with all downstream services
- JWT verification happens at the gateway level, allowing backend services to focus on business logic
- CORS is configured to allow specified origins only

### 2.1 Implement API Gateway Service (Week 2, Day 3-5)

- [x] Create API Gateway service using Node.js/Express
- [x] Implement routing to microservices with proxy middleware
- [x] Add authentication middleware with JWT validation
- [x] Implement rate limiting for API protection
- [x] Set up request logging and error handling
- [x] Add health check endpoints for monitoring service status
- [x] Configure Swagger documentation for API endpoints

**API Gateway Structure Implemented:**
```
services/api-gateway/
├── src/
│   ├── config/
│   │   └── config.ts            # Configuration with environment variables
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT validation
│   │   ├── proxy.middleware.ts  # Service routing
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   └── requestId.middleware.ts # Request tracking
│   ├── controllers/
│   │   └── health.controller.ts # Health check endpoints
│   ├── routes/
│   │   └── health.routes.ts     # Health check routes
│   ├── utils/
│   │   └── logger.ts            # Centralized logging
│   ├── app.ts                   # Express application setup
│   └── server.ts                # HTTP server
├── swagger.json                 # API documentation
├── Dockerfile                   # Production container
├── Dockerfile.dev               # Development container
├── healthcheck.js               # Container health checks
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript configuration
```

### 2.2 Update Docker Compose for API Gateway (Week 2, Day 6)

- [x] Add API Gateway service to Docker Compose
- [x] Configure environment variables for service connectivity
- [x] Set up health checks for container monitoring
- [x] Configure volume mounts for logs and code
- [x] Set up service dependencies
- [x] Update environment files with API Gateway configuration

**Docker Compose API Gateway Configuration Implemented:**
```yaml
# API Gateway
api-gateway:
  build:
    context: ../../services/api-gateway
    dockerfile: Dockerfile.dev
  ports:
    - "8000:8000"  # Changed from 3000 to avoid port conflicts
  environment:
    - NODE_ENV=development
    - PORT=8000
    - SERVICE_NAME=api-gateway
    - API_PREFIX=/api/v1
    # Service URLs
    - AUTH_SERVICE_URL=http://auth-service:3001
    - CHURCH_SERVICE_URL=http://church-service:3002
    - MEMBER_SERVICE_URL=http://member-service:3003
    - EVENT_SERVICE_URL=http://events-service:3004
    # JWT and security configuration
    - JWT_SECRET=dev_jwt_secret
    - JWT_EXPIRES_IN=1d
    # Additional configuration for caching, rate limiting, etc.
  volumes:
    - ../../services/api-gateway:/app
    - /app/node_modules
    - ../../services/api-gateway/logs:/app/logs
  networks:
    - church-planner-network
  depends_on:
    - redis
    - auth-service
    - church-service
    - member-service
    - events-service
  healthcheck:
    test: ["CMD", "node", "healthcheck.js"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 2.3 Update Client to Use API Gateway (Week 2, Day 7)

- [x] Update client API service to point to API Gateway
- [x] Test client functionality with API Gateway
- [x] Fix any integration issues

**Implementation Plan for Client Update:**
1. Create an API client service singleton in the client application
2. Configure base URL to point to the API Gateway (`http://localhost:8000/api/v1`)
3. Update authentication flow to work with the new API Gateway routes
4. Standardize error handling for gateway responses
5. Implement request retry logic for temporary service unavailability
6. Add request/response interceptors for authentication tokens
7. Create service-specific modules for different API domains:
   - `authService.ts` - Authentication and user management
   - `churchService.ts` - Church management operations
   - `memberService.ts` - Member management operations
   - `eventService.ts` - Event scheduling and management

**Implemented Client Changes:**
```typescript
// API Client (client.ts)
export class ApiClient {
  private baseUrl: string;
  private axios: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor for adding auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for handling common errors
    this.axios.interceptors.response.use(
      // ... error handling logic
    );
  }
  
  // Methods for GET, POST, PUT, DELETE operations
}

// Created service API modules:
// - authAPI.ts
// - churchAPI.ts
// - memberAPI.ts
// - eventAPI.ts
```

## Phase 3: Service Decomposition

**Goal**: Gradually decompose the monolith into microservices without disrupting functionality.

### 3.1 Auth Service Implementation (Week 3, Day 1-3)

- [x] Extract authentication logic from monolith
- [x] Implement user registration, login, and token validation
- [x] Set up JWT handling and password management
- [x] Configure auth database
- [x] Implement refresh token functionality
- [x] Add token blacklisting for logout
- [x] Enhance password security with complexity requirements

**Auth Service Endpoints:**
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/refresh-token
- [x] POST /auth/logout
- [x] GET /auth/me
- [x] PUT /auth/updatedetails
- [x] PUT /auth/updatepassword
- [ ] POST /auth/forgotpassword
- [ ] PUT /auth/resetpassword/:resettoken

### 3.2 Church Service Implementation (Week 3, Day 4-7)

- [ ] Extract church management logic from monolith
- [ ] Implement church CRUD operations
- [ ] Set up team management functionality
- [ ] Configure church database

**Church Service Endpoints:**
- [ ] GET /churches
- [ ] POST /churches
- [ ] GET /churches/:id
- [ ] PUT /churches/:id
- [ ] DELETE /churches/:id
- [ ] GET /churches/my-churches
- [ ] POST /churches/:id/admins
- [ ] DELETE /churches/:id/admins/:adminId

### 3.3 Member Service Implementation (Week 4, Day 1-3)

- [ ] Extract member management logic from monolith
- [ ] Implement church member CRUD operations
- [ ] Set up statistics and searching functionality
- [ ] Configure member database

**Member Service Endpoints:**
- [ ] GET /churches/:churchId/members
- [ ] POST /churches/:churchId/members
- [ ] GET /churches/:churchId/members/:id
- [ ] PUT /churches/:churchId/members/:id
- [ ] DELETE /churches/:churchId/members/:id
- [ ] GET /churches/:churchId/members/stats
- [ ] GET /churches/:churchId/members/search

### 3.4 Events Service Implementation (Week 4, Day 4-7)

- [ ] Extract events management logic from monolith
- [ ] Implement event CRUD operations
- [ ] Set up event types and service scheduling
- [ ] Configure events database

**Events Service Endpoints:**
- [ ] GET /churches/:churchId/events
- [ ] POST /churches/:churchId/events
- [ ] GET /churches/:churchId/events/:id
- [ ] PUT /churches/:churchId/events/:id
- [ ] DELETE /churches/:churchId/events/:id
- [ ] GET /churches/:churchId/services
- [ ] POST /churches/:churchId/services

### 3.5 Message Queue Integration (Week 5, Day 1-2)

- [ ] Set up RabbitMQ for inter-service communication
- [ ] Implement event-driven updates between services
- [ ] Configure message consumers and producers

**Message Types:**
- [ ] UserCreated
- [ ] UserUpdated
- [ ] ChurchCreated
- [ ] ChurchUpdated
- [ ] MemberCreated
- [ ] MemberUpdated
- [ ] EventCreated
- [ ] EventUpdated

### 3.6 Redis Cache Integration (Week 5, Day 3-4)

- [ ] Set up Redis for caching frequently accessed data
- [ ] Implement cache invalidation strategies
- [ ] Configure TTL for different data types

**Caching Strategy:**
- [ ] Cache user authentication status
- [ ] Cache church lists and details
- [ ] Cache frequently accessed member lists
- [ ] Implement cache clearing on updates

## Phase 4: Monitoring and Observability

**Goal**: Implement comprehensive monitoring, logging, and visualization tools.

### 4.1 Logging Infrastructure (Week 5, Day 5-6)

- [ ] Set up centralized logging with ELK Stack
- [ ] Configure structured logging in all services
- [ ] Implement log correlation with request IDs

**ELK Stack Configuration:**
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
  environment:
    - discovery.type=single-node
  volumes:
    - elasticsearch-data:/usr/share/elasticsearch/data
  networks:
    - church-planner-network
  ports:
    - "9200:9200"

logstash:
  image: docker.elastic.co/logstash/logstash:7.17.0
  volumes:
    - ./infrastructure/logging/logstash/config:/usr/share/logstash/config
    - ./infrastructure/logging/logstash/pipeline:/usr/share/logstash/pipeline
  networks:
    - church-planner-network
  depends_on:
    - elasticsearch

kibana:
  image: docker.elastic.co/kibana/kibana:7.17.0
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
  networks:
    - church-planner-network
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch
```

### 4.2 Metrics Collection with Prometheus (Week 5, Day 7 - Week 6, Day 1)

- [ ] Set up Prometheus for metrics collection
- [ ] Configure service-level metrics
- [ ] Set up infrastructure metrics

**Prometheus Configuration:**
```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./infrastructure/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus-data:/prometheus
  networks:
    - church-planner-network
  ports:
    - "9090:9090"

node-exporter:
  image: prom/node-exporter
  networks:
    - church-planner-network
  ports:
    - "9100:9100"
```

### 4.3 Visualization with Grafana (Week 6, Day 2-3)

- [ ] Set up Grafana for metrics visualization
- [ ] Create dashboards for services monitoring
- [ ] Set up alerting for critical metrics

**Grafana Configuration:**
```yaml
grafana:
  image: grafana/grafana
  volumes:
    - ./infrastructure/monitoring/grafana/provisioning:/etc/grafana/provisioning
    - grafana-data:/var/lib/grafana
  networks:
    - church-planner-network
  ports:
    - "3010:3000"
  depends_on:
    - prometheus
```

### 4.4 Distributed Tracing with Jaeger (Week 6, Day 4-5)

- [ ] Set up Jaeger for distributed tracing
- [ ] Implement trace instrumentation in services
- [ ] Configure sampling and trace collection

**Jaeger Configuration:**
```yaml
jaeger:
  image: jaegertracing/all-in-one
  networks:
    - church-planner-network
  ports:
    - "5775:5775/udp"
    - "6831:6831/udp"
    - "6832:6832/udp"
    - "5778:5778"
    - "16686:16686"
    - "14268:14268"
    - "9411:9411"
```

## Phase 5: Testing and Validation

**Goal**: Ensure the new microservices architecture works correctly and maintains functionality.

### 5.1 Unit Testing for Each Service (Week 6, Day 6-7)

- [ ] Implement unit tests for each service
- [ ] Set up test coverage reporting
- [ ] Automate test execution in CI/CD

**Test Structure:**
```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── utils/
└── integration/
    ├── routes/
    └── api/
```

### 5.2 Integration Testing (Week 7, Day 1-2)

- [ ] Implement integration tests for service interactions
- [ ] Test end-to-end workflows
- [ ] Validate API Gateway routing

### 5.3 Performance Testing (Week 7, Day 3-4)

- [ ] Benchmark service response times
- [ ] Test system under load
- [ ] Identify and fix bottlenecks

**Performance Test Areas:**
- [ ] Authentication flows
- [ ] Church and member data retrieval
- [ ] Event creation and listing
- [ ] Search and filtering operations

### 5.4 Security Testing (Week 7, Day 5)

- [ ] Perform security assessments
- [ ] Test authentication and authorization
- [ ] Validate data encryption and protection

**Security Test Checklist:**
- [ ] Authentication bypass testing
- [ ] Authorization testing
- [ ] Input validation testing
- [ ] JWT security testing
- [ ] API security testing

## Phase 6: Production Readiness

**Goal**: Ensure the system is ready for production deployment.

### 6.1 Production Docker Compose (Week 7, Day 6-7)

- [ ] Create production Docker Compose configuration
- [ ] Optimize for performance and security
- [ ] Configure environment variables

### 6.2 Documentation (Week 8, Day 1-2)

- [ ] Update API documentation
- [ ] Create architecture documentation
- [ ] Document deployment and operations procedures

**Documentation Structure:**
```
docs/
├── architecture/
│   ├── overview.md
│   ├── data-flow.md
│   └── security.md
├── api/
│   ├── auth-service.md
│   ├── church-service.md
│   ├── member-service.md
│   └── events-service.md
└── operations/
    ├── deployment.md
    ├── monitoring.md
    └── troubleshooting.md
```

### 6.3 Database Migration Scripts (Week 8, Day 3)

- [ ] Create migration scripts for production data
- [ ] Test migration procedures
- [ ] Document rollback procedures

### 6.4 Finalize CI/CD Pipeline (Week 8, Day 4-5)

- [ ] Set up CI/CD for all services
- [ ] Configure automated testing
- [ ] Set up staged deployments

## Progress Tracking

| Task | Description | Status | Completion Date |
|------|-------------|--------|----------------|
| Task 1.1 | Create New Directory Structure | ✅ | March 15, 2025 |
| Task 1.2 | Setup Base Docker Compose Files | ✅ | March 16, 2025 |
| Task 2.1 | Implement API Gateway - Base Configuration | ✅ | March 22, 2025 |
| Task 2.2 | Update Docker Compose | ✅ | March 23, 2025 |
| Task 2.3 | Update Client Application | ⬜ | - |
| Task 3.1 | Implement Auth Service - Base | ✅ | March 25, 2025 |
| Task 3.2 | Implement Auth Service - JWT | ✅ | March 26, 2025 |
| Task 3.3 | Implement Auth Service - Security Features | ✅ | March 27, 2025 |
| Task 3.4 | Test Auth Service | ⬜ | - |
| Task 4.1 | Implement Member Service - Base | ✅ | March 30, 2025 |
| Task 4.2 | Implement Member Service - Advanced Features | ⬜ | - |
| Task 5.1 | Implement Church Service - Base | ✅ | March 29, 2025 |
| Task 5.2 | Implement Church Service - Advanced Features | ⬜ | - |
| Task 6.1-6.4 | Events Service and Monitoring | ⬜ | - |

## Current Status and Next Steps

### Progress Tracking Table

| Task                                            | Status | Completion Date |
|:------------------------------------------------|:-------|:----------------|
| 1.1: Create New Directory Structure             | ✅     | March 15, 2025  |
| 1.2: Setup Base Docker Compose Files            | ✅     | March 16, 2025  |
| 2.1: Implement API Gateway - Base Configuration | ✅     | March 22, 2025  |
| 2.2: Update Docker Compose                      | ✅     | March 23, 2025  |
| 3.1: Implement Auth Service - Core Features     | ✅     | April 5, 2025    |
| 3.2: Implement JWT Authentication               | ✅     | April 7, 2025    |
| 3.3: Create User Management Endpoints           | ✅     | April 12, 2025   |
| 4.1: Implement Church Service - Core Features   | ✅     | April 20, 2025   |
| 4.2: Create Church Management Endpoints         | ✅     | April 25, 2025   |
| 5.1: Implement Member Service - Core Features   | ✅     | May 8, 2025       |
| 5.2: Create Member Management Endpoints         | ✅     | May 15, 2025      |
| 6.1: Implement Events Service - Core Features   | ✅     | May 28, 2025      |
| 6.2: Create Event Management Endpoints          | ✅     | June 5, 2025       |
| 6.3: Implement Calendar Integration             | ✅     | June 15, 2025   |
| 6.4: Add Recurring Events Support               | ✅     | June 10, 2025     |
| 7.1: Implement Notification Service             | ⬜     |                 |
| 7.2: Set Up Email Templates                     | ⬜     |                 |
| 7.3: Implement Push Notifications               | ⬜     |                 |
| 8.1: Implement Client Application - Base UI     | ⬜     |                 |
| 8.2: Add Authentication Flows                   | ⬜     |                 |
| 8.3: Implement Service-Specific Screens         | ⬜     |                 |

### Current Progress Summary (June 15, 2025)

We have made significant progress in our microservices implementation for the Church Planner application. All core microservices have been implemented with their essential features:

1. **Infrastructure Foundation (Phase 1)**: Complete - We have established the directory structure and Docker Compose files needed for our microservices architecture.

2. **API Gateway Implementation (Phase 2)**: Complete - The API Gateway is in place with service routing, security features, logging, and health checks.

3. **Auth Service (Phase 3)**: Complete - The authentication service is fully functional with JWT authentication, refresh token support, password management, and role-based access control.

4. **Church Service (Phase 4)**: Complete - The church management service is operational with endpoints for creating, updating, and querying church information.

5. **Member Service (Phase 5)**: Complete - The member management service is implemented with comprehensive profile management, church membership tracking, and validation.

6. **Events Service (Phase 6)**: Complete - We have now fully implemented the Events Service with:
   - Basic event management (CRUD operations)
   - Team and attendee management
   - Service scheduling and recurring events
   - Calendar integration with iCal feed generation
   - Export capabilities for various formats (ical, json, csv)
   - Webhook endpoints for external calendar service synchronization

### Immediate Next Steps

1. **Begin Notification Service Implementation**:
   - Set up the basic service structure
   - Implement email notification templates for various event types
   - Create notification preferences for users
   - Integrate with the Events Service for event reminders

2. **Start Client Application Development**:
   - Create the base UI structure
   - Implement authentication flows
   - Begin development of the dashboard and calendar views

3. **Implement Comprehensive Integration Testing**:
   - Create end-to-end tests for typical user workflows
   - Test all service interactions
   - Validate webhook endpoints and calendar integration

### Key Challenges and Mitigations

1. **Service Dependency Management**:
   - Challenge: Managing dependencies between services while maintaining loose coupling
   - Mitigation: We've implemented event-driven communication patterns and API contracts to minimize tight coupling

2. **Data Ownership and Consistency**:
   - Challenge: Ensuring data consistency across services
   - Mitigation: Each service maintains ownership of its domain data, with appropriate synchronization mechanisms

3. **Testing Complexity**:
   - Challenge: Testing microservices with cross-service dependencies
   - Mitigation: We've implemented comprehensive unit tests and are developing integration tests using service mocks

4. **Calendar Integration Complexity**:
   - Challenge: Supporting various calendar formats and external providers
   - Mitigation: We've implemented a flexible calendar controller with standardized output formats
   
// ... existing code (if any) ... 