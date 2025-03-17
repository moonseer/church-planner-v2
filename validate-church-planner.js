#!/usr/bin/env node

/**
 * Church Planner v2 - Comprehensive Validation Script
 * 
 * This script performs a thorough validation of the current state of the Church Planner v2 application,
 * including checking:
 * - Project structure
 * - Server configuration
 * - Client configuration
 * - API endpoints
 * - Authentication security
 * - Database models
 * - Docker configuration
 * - API documentation
 * - Type system
 * 
 * Usage: node validate-church-planner.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

// ANSI color codes for better output formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  }
};

// Logging utilities
const logSuccess = (message) => console.log(`${colors.fg.green}✓ ${message}${colors.reset}`);
const logError = (message) => console.log(`${colors.fg.red}✗ ${message}${colors.reset}`);
const logWarning = (message) => console.log(`${colors.fg.yellow}⚠ ${message}${colors.reset}`);
const logInfo = (message) => console.log(`${colors.fg.blue}ℹ ${message}${colors.reset}`);
const logHeader = (message) => {
  const separator = '='.repeat(message.length + 4);
  console.log(`\n${colors.fg.cyan}${separator}${colors.reset}`);
  console.log(`${colors.fg.cyan}= ${colors.bright}${message}${colors.reset} ${colors.fg.cyan}=${colors.reset}`);
  console.log(`${colors.fg.cyan}${separator}${colors.reset}\n`);
};

// File system utilities
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

const dirExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
};

// Read files safely
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
};

const readTextFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
};

// Check if Docker is installed and running
const isDockerRunning = () => {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
};

const isServerRunning = async (port = 8080) => {
  return new Promise((resolve) => {
    const req = http.request(
      {
        method: 'GET',
        hostname: 'localhost',
        port: port,
        path: '/api/health',
        timeout: 2000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

// HTTP request utility
const makeRequest = async (method, path, data = null, token = null, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      hostname: 'localhost',
      port: 8080,
      path: path,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: timeout,
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(responseData)
            });
          } else {
            resolve({
              statusCode: res.statusCode,
              data: responseData
            });
          }
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            parseError: err.message
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request to ${path} timed out after ${options.timeout}ms`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test authentication endpoints
const testAuthEndpoints = async () => {
  let passedChecks = 0;
  let totalChecks = 4; // Register, Login, Get Current User, JWT Security
  let authToken = null;
  let userId = null;
  
  try {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      logError('Server is not running. Please start the server before testing.');
      return { passed: 0, total: totalChecks };
    }
    
    // Generate a unique email for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    // Test registration
    try {
      logInfo('Testing user registration endpoint...');
      const registrationData = {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        password: testPassword
      };
      
      const registerResponse = await makeRequest('POST', '/api/auth/register', registrationData);
      
      if (registerResponse.statusCode === 201 && registerResponse.data.token) {
        logSuccess('User registration successful');
        passedChecks++;
        authToken = registerResponse.data.token;
        userId = registerResponse.data.user?._id || null;
      } else {
        logError(`User registration failed: ${JSON.stringify(registerResponse.data)}`);
      }
    } catch (err) {
      logError(`Error during registration: ${err.message}`);
    }
    
    // Test login
    try {
      logInfo('Testing user login endpoint...');
      const loginData = {
        email: testEmail,
        password: testPassword
      };
      
      const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
      
      if (loginResponse.statusCode === 200 && loginResponse.data.token) {
        logSuccess('User login successful');
        passedChecks++;
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user?._id || userId;
      } else {
        logError(`User login failed: ${JSON.stringify(loginResponse.data)}`);
      }
    } catch (err) {
      logError(`Error during login: ${err.message}`);
    }
    
    // Test get current user
    if (authToken) {
      try {
        logInfo('Testing get current user endpoint...');
        const userResponse = await makeRequest('GET', '/api/auth/me', null, authToken);
        
        if (userResponse.statusCode === 200 && userResponse.data.user) {
          logSuccess('Get current user successful');
          passedChecks++;
        } else {
          logError(`Get current user failed: ${JSON.stringify(userResponse.data)}`);
        }
      } catch (err) {
        logError(`Error getting current user: ${err.message}`);
      }
    } else {
      logError('Skipping get current user test: No authentication token available');
    }
    
    // Check JWT security
    if (authToken) {
      try {
        logInfo('Validating JWT token security...');
        const jwtParts = authToken.split('.');
        
        if (jwtParts.length !== 3) {
          logError('Invalid JWT format: token should have three parts');
        } else {
          // Check for hardcoded secrets in .env files
          const envFiles = [
            '.env.development',
            '.env.production',
            '.env.staging',
            '.env.example',
            'server/.env'
          ];
          
          let jwtSecretFound = false;
          let isHardcoded = false;
          
          for (const envFile of envFiles) {
            if (fileExists(envFile)) {
              const envContent = readTextFile(envFile);
              if (envContent) {
                if (envContent.includes('JWT_SECRET')) {
                  jwtSecretFound = true;
                  
                  // Check if it appears to be a hardcoded value rather than a reference
                  const jwtSecretMatch = envContent.match(/JWT_SECRET\s*=\s*["']([^"']*)["']/);
                  if (jwtSecretMatch && jwtSecretMatch[1]) {
                    const secretValue = jwtSecretMatch[1];
                    if (secretValue.length < 32 || secretValue.includes('secret')) {
                      isHardcoded = true;
                      logWarning(`Potentially insecure JWT secret found in ${envFile}: "${secretValue}"`);
                    }
                  }
                }
              }
            }
          }
          
          if (jwtSecretFound) {
            if (isHardcoded) {
              logWarning('JWT secret appears to be hardcoded or weak. This is a security risk.');
            } else {
              logSuccess('JWT secret configuration found');
              passedChecks++;
            }
          } else {
            logError('JWT_SECRET configuration not found in any .env file');
          }
        }
      } catch (err) {
        logError(`Error validating JWT security: ${err.message}`);
      }
    } else {
      logError('Skipping JWT security test: No authentication token available');
    }
  } catch (err) {
    logError(`Error in authentication tests: ${err.message}`);
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Test models and controllers
const testModelsAndControllers = async (authToken) => {
  if (!authToken) {
    logError('No authentication token available. Skipping API tests.');
    return { passed: 0, total: 0 };
  }
  
  const endpoints = [
    { method: 'GET', path: '/api/churches', name: 'Get churches' },
    { method: 'POST', path: '/api/churches', name: 'Create church', data: { name: 'Test Church', address: '123 Test St', city: 'Testville', state: 'TS', zipCode: '12345', phone: '123-456-7890', email: 'church@test.com' } },
    { method: 'GET', path: '/api/event-types', name: 'Get event types' },
    { method: 'POST', path: '/api/event-types', name: 'Create event type', data: { name: 'Test Event Type', color: '#FF5733' } },
    { method: 'GET', path: '/api/events', name: 'Get events' },
    { method: 'POST', path: '/api/events', name: 'Create event', data: { title: 'Test Event', description: 'Test description', start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString(), location: 'Test Location' } },
    { method: 'GET', path: '/api/teams', name: 'Get teams' },
    { method: 'POST', path: '/api/teams', name: 'Create team', data: { name: 'Test Team', description: 'Test team description' } },
    { method: 'GET', path: '/api/services', name: 'Get services' },
    { method: 'POST', path: '/api/services', name: 'Create service', data: { title: 'Test Service', date: new Date().toISOString(), description: 'Test service description', items: [] } }
  ];
  
  let passedChecks = 0;
  let totalChecks = endpoints.length;
  
  for (const endpoint of endpoints) {
    try {
      logInfo(`Testing ${endpoint.name} endpoint...`);
      const response = await makeRequest(endpoint.method, endpoint.path, endpoint.data, authToken);
      
      if (endpoint.method === 'GET' && response.statusCode === 200) {
        logSuccess(`${endpoint.name} endpoint successful`);
        passedChecks++;
      } else if (endpoint.method === 'POST' && (response.statusCode === 201 || response.statusCode === 200)) {
        logSuccess(`${endpoint.name} endpoint successful`);
        passedChecks++;
      } else {
        logError(`${endpoint.name} endpoint failed: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      logError(`Error testing ${endpoint.name}: ${err.message}`);
    }
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Test API Documentation
const testApiDocumentation = async () => {
  let passedChecks = 0;
  let totalChecks = 2;
  
  // Check Swagger UI endpoint
  try {
    logInfo('Testing Swagger UI endpoint...');
    const response = await makeRequest('GET', '/api/docs');
    
    if (response.statusCode === 200) {
      logSuccess('Swagger UI endpoint is accessible');
      passedChecks++;
    } else {
      logError(`Swagger UI endpoint failed: ${response.statusCode}`);
    }
  } catch (err) {
    logError(`Error testing Swagger UI: ${err.message}`);
  }
  
  // Check OpenAPI JSON
  try {
    logInfo('Testing OpenAPI JSON endpoint...');
    const response = await makeRequest('GET', '/api/docs/swagger.json');
    
    if (response.statusCode === 200 && response.data) {
      logSuccess('OpenAPI JSON endpoint is accessible');
      passedChecks++;
    } else {
      logError(`OpenAPI JSON endpoint failed: ${response.statusCode}`);
    }
  } catch (err) {
    logError(`Error testing OpenAPI JSON: ${err.message}`);
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Test Docker configuration
const testDockerConfiguration = async () => {
  let passedChecks = 0;
  let totalChecks = 3;
  
  // Check if Docker is available
  if (isDockerRunning()) {
    logSuccess('Docker is installed and running');
    passedChecks++;
  } else {
    logError('Docker is not installed or not running');
    return { passed: passedChecks, total: totalChecks };
  }
  
  // Check docker-compose files
  const composeFiles = ['docker-compose.yml', 'docker-compose.dev.yml', 'docker-compose.monitoring.yml'];
  
  for (const file of composeFiles) {
    if (fileExists(file)) {
      logSuccess(`Docker compose file ${file} exists`);
      passedChecks++;
    } else {
      logError(`Docker compose file ${file} not found`);
    }
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Test type system and code quality
const testTypeSystem = async () => {
  let passedChecks = 0;
  let totalChecks = 4;
  
  // Check TypeScript configurations
  if (fileExists(path.join('server', 'tsconfig.json'))) {
    logSuccess('Server TypeScript configuration exists');
    passedChecks++;
  } else {
    logError('Server TypeScript configuration not found');
  }
  
  if (fileExists(path.join('client', 'tsconfig.json'))) {
    logSuccess('Client TypeScript configuration exists');
    passedChecks++;
  } else {
    logError('Client TypeScript configuration not found');
  }
  
  // Check for shared types
  if (dirExists('shared') && dirExists(path.join('shared', 'types'))) {
    logSuccess('Shared types directory exists');
    passedChecks++;
  } else {
    logError('Shared types directory not found');
  }
  
  // Try to run TypeScript check
  try {
    logInfo('Running TypeScript check...');
    execSync('npm run typecheck:all', { stdio: 'ignore' });
    logSuccess('TypeScript check passed');
    passedChecks++;
  } catch (err) {
    logError('TypeScript check failed');
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Test test coverage
const testTestCoverage = async () => {
  let passedChecks = 0;
  let totalChecks = 2;
  
  // Check Jest configuration
  if (fileExists(path.join('server', 'jest.config.js'))) {
    logSuccess('Server Jest configuration exists');
    passedChecks++;
  } else {
    logError('Server Jest configuration not found');
  }
  
  // Check coverage reports
  if (dirExists(path.join('server', 'coverage'))) {
    logSuccess('Server test coverage reports exist');
    passedChecks++;
  } else {
    logWarning('Server test coverage reports not found. Tests may not have been run yet.');
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Check for security issues
const testSecurityConfiguration = async () => {
  let passedChecks = 0;
  let totalChecks = 3;
  
  // Check HTTPS configuration
  const envFiles = ['.env.production', '.env.staging', '.env.development'];
  let httpsConfigured = false;
  
  for (const envFile of envFiles) {
    if (fileExists(envFile)) {
      const envContent = readTextFile(envFile);
      if (envContent && envContent.includes('HTTPS=true')) {
        httpsConfigured = true;
        break;
      }
    }
  }
  
  if (httpsConfigured) {
    logSuccess('HTTPS is configured in at least one environment');
    passedChecks++;
  } else {
    logWarning('HTTPS is not configured in any environment file');
  }
  
  // Check for localStorage token usage in client code
  try {
    logInfo('Checking for insecure token storage...');
    const result = execSync('grep -r "localStorage.setItem" --include="*.ts" --include="*.tsx" client/src', { encoding: 'utf8' });
    
    if (result.includes('token')) {
      logError('Insecure token storage detected: using localStorage for tokens');
    } else {
      logSuccess('No insecure token storage detected in client code');
      passedChecks++;
    }
  } catch (err) {
    // grep returns non-zero if no matches, which is what we want
    if (err.status === 1) {
      logSuccess('No insecure token storage detected in client code');
      passedChecks++;
    } else {
      logError(`Error checking for insecure token storage: ${err.message}`);
    }
  }
  
  // Check for CSRF protection
  try {
    logInfo('Checking for CSRF protection...');
    const serverIndex = readTextFile(path.join('server', 'src', 'index.ts'));
    
    if (serverIndex && (serverIndex.includes('csrf') || serverIndex.includes('csurf'))) {
      logSuccess('CSRF protection appears to be configured');
      passedChecks++;
    } else {
      logError('CSRF protection not detected in server configuration');
    }
  } catch (err) {
    logError(`Error checking for CSRF protection: ${err.message}`);
  }
  
  return { passed: passedChecks, total: totalChecks };
};

// Main validation function
async function validateProjectSetup() {
  logHeader('Church Planner v2 - Comprehensive Validation');
  
  const results = {
    auth: { passed: 0, total: 0 },
    api: { passed: 0, total: 0 },
    apiDocs: { passed: 0, total: 0 },
    docker: { passed: 0, total: 0 },
    typeSystem: { passed: 0, total: 0 },
    testCoverage: { passed: 0, total: 0 },
    security: { passed: 0, total: 0 }
  };
  
  // Run the tests
  results.auth = await testAuthEndpoints();
  
  // Only continue with API tests if we got an auth token
  if (results.auth.passed > 0) {
    results.api = await testModelsAndControllers(global.authToken);
    results.apiDocs = await testApiDocumentation();
  }
  
  results.docker = await testDockerConfiguration();
  results.typeSystem = await testTypeSystem();
  results.testCoverage = await testTestCoverage();
  results.security = await testSecurityConfiguration();
  
  // Calculate total results
  const totalPassed = Object.values(results).reduce((sum, result) => sum + result.passed, 0);
  const totalChecks = Object.values(results).reduce((sum, result) => sum + result.total, 0);
  const percentage = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0;
  
  // Output results summary
  logHeader('Validation Results Summary');
  
  console.log(`Authentication: ${results.auth.passed}/${results.auth.total}`);
  console.log(`API Endpoints: ${results.api.passed}/${results.api.total}`);
  console.log(`API Documentation: ${results.apiDocs.passed}/${results.apiDocs.total}`);
  console.log(`Docker Configuration: ${results.docker.passed}/${results.docker.total}`);
  console.log(`Type System: ${results.typeSystem.passed}/${results.typeSystem.total}`);
  console.log(`Test Coverage: ${results.testCoverage.passed}/${results.testCoverage.total}`);
  console.log(`Security Configuration: ${results.security.passed}/${results.security.total}`);
  console.log(`\nTotal: ${totalPassed}/${totalChecks} (${percentage}%)`);
  
  // Output recommendations based on results
  logHeader('Priority Recommendations');
  
  if (results.security.passed < results.security.total) {
    logError('1. Address critical security issues:');
    console.log('   - Replace localStorage token storage with HTTP-only cookies');
    console.log('   - Implement CSRF protection for API endpoints');
    console.log('   - Remove hardcoded JWT secrets and use secure environment variables');
    console.log('   - Add rate limiting for authentication endpoints\n');
  }
  
  if (results.testCoverage.passed < results.testCoverage.total) {
    logWarning('2. Improve test coverage:');
    console.log('   - Reach the goal of 70% coverage for all metrics');
    console.log('   - Implement client-side testing with Vitest');
    console.log('   - Add end-to-end testing with Playwright\n');
  }
  
  if (results.apiDocs.passed < results.apiDocs.total) {
    logWarning('3. Fix Swagger documentation:');
    console.log('   - Resolve the bug preventing Swagger UI from loading at /api/docs endpoint\n');
  }
  
  console.log(`To address these issues, follow the recommendations in order of priority.`);
  console.log(`Run this validation script again after making changes to verify improvements.`);
}

// Run the validation
validateProjectSetup().catch(err => {
  console.error('Validation failed with error:', err);
  process.exit(1);
});
