# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ./src ./src
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
COPY --from=builder /app/../shared ../shared

# Copy health check script
COPY healthcheck.js ./

# Expose the service port
EXPOSE 3000

# Set health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["node", "healthcheck.js"]

# Set node environment
ENV NODE_ENV=production

# Run the service
CMD ["node", "dist/server.js"] 