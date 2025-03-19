# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code and swagger docs
COPY ./src ./src
COPY ./swagger.json ./swagger.json
COPY ./shared ../shared

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy build output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.json ./swagger.json
COPY --from=builder /app/../shared ../shared

# Copy health check script
COPY healthcheck.js ./

# Create directory for logs
RUN mkdir -p logs

# Expose the API Gateway port (different from service ports)
EXPOSE 8000

# Set health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["node", "healthcheck.js"]

# Set node environment
ENV NODE_ENV=production
ENV SERVICE_NAME=api-gateway

# Run the API Gateway
CMD ["node", "dist/server.js"] 