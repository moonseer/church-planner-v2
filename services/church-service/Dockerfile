FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Build TypeScript files
RUN npm run build

# Expose port
EXPOSE 3002

# Run the app
CMD ["node", "dist/server.js"] 