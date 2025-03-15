FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies (no dev dependencies)
# Also ensure logging packages are installed
RUN npm ci --omit=dev || npm install --omit=dev && \
    npm install --no-save --omit=dev winston winston-daily-rotate-file @sentry/node morgan

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Add a non-root user and change ownership
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

# Expose the port the server will run on
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"] 