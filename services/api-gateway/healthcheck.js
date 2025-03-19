// Simple health check script for Docker
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 8000,
  path: '/health',
  timeout: 2000
};

// Send a request to the health endpoint
const healthCheck = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  
  // Health check passes if status code is 200-399
  if (res.statusCode >= 200 && res.statusCode < 400) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

// Handle request errors
healthCheck.on('error', (err) => {
  console.error('Health check failed:', err);
  process.exit(1); // Failure
});

// Handle timeout
healthCheck.on('timeout', () => {
  console.error('Health check timed out');
  healthCheck.abort();
  process.exit(1); // Failure
});

// Send the request
healthCheck.end(); 