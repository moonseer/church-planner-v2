#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// ANSI color codes for better output formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
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
    crimson: '\x1b[48m'
  }
};

// Helper functions
const logSuccess = (message) => console.log(`${colors.fg.green}✓ ${message}${colors.reset}`);
const logError = (message) => console.log(`${colors.fg.red}✗ ${message}${colors.reset}`);
const logInfo = (message) => console.log(`${colors.fg.blue}ℹ ${message}${colors.reset}`);
const logWarning = (message) => console.log(`${colors.fg.yellow}⚠ ${message}${colors.reset}`);
const logHeader = (message) => console.log(`\n${colors.fg.cyan}${colors.bright}${message}${colors.reset}\n`);

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Function to check if a directory exists
const dirExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
};

// Function to check if a package is installed
const packageInstalled = (packageName, directory = '') => {
  try {
    const packageJsonPath = path.join(__dirname, directory, 'package.json');
    if (!fileExists(packageJsonPath)) return false;
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return (
      (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName])
    );
  } catch (err) {
    return false;
  }
};

// Function to check if Docker is running
const isDockerRunning = () => {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
};

// Function to check if MongoDB container is running
const isMongoDBRunning = () => {
  try {
    const output = execSync('docker ps --filter "name=church-planner-mongodb" --format "{{.Names}}"').toString().trim();
    return output === 'church-planner-mongodb';
  } catch (err) {
    return false;
  }
};

// Function to test MongoDB connection
const testMongoDBConnection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      logError('MongoDB connection string not found in environment variables');
      return false;
    }
    
    logInfo(`Attempting to connect to MongoDB using: ${process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    await mongoose.connect(process.env.MONGO_URI);
    logSuccess('Successfully connected to MongoDB');
    await mongoose.disconnect();
    return true;
  } catch (err) {
    logError(`Failed to connect to MongoDB: ${err.message}`);
    return false;
  }
};

// Function to check if the server is running
const isServerRunning = async (port = process.env.PORT || 3000) => {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'GET',
      hostname: 'localhost',
      port: port,
      path: '/',
      timeout: 3000
    }, (res) => {
      resolve(res.statusCode < 500);
    });
    
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

// Function to make HTTP requests
const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: path,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };
    
    // Add authorization header if token is provided
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
      logInfo(`Request to ${path} includes Authorization header: Bearer ${token.substring(0, 10)}...`);
    } else {
      logInfo(`Request to ${path} does not include Authorization header`);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse as JSON
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (err) {
          // If parsing fails, return the raw response data
          logWarning(`Failed to parse response as JSON: ${err.message.substring(0, 100)}`);
          logInfo(`Response starts with: ${responseData.substring(0, 50)}...`);
          
          // Still resolve with the raw data instead of rejecting
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
    
    // Add timeout handler
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

// Function to test JWT authentication endpoints
const testAuthEndpoints = async () => {
  let passedAuthChecks = 0;
  let totalAuthChecks = 3; // Register, Login, Get Current User
  let authToken = null;
  
  try {
    // Check if server is running
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      logError('Server is not running. Please start the server before testing authentication endpoints.');
      return { passed: 0, total: totalAuthChecks };
    }
    
    // Generate a unique email for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    
    // Test user registration
    try {
      logInfo('Testing POST /api/auth/register endpoint...');
      const userData = {
        name: 'Test User',
        email: testEmail,
        password: testPassword,
        churchName: 'Test Church',
        churchAddress: '123 Test Street',
        churchCity: 'Test City',
        churchState: 'TS',
        churchZip: '12345'
      };
      
      const response = await makeRequest('POST', '/api/auth/register', userData);
      
      if (response.statusCode === 201 && response.data.success && response.data.token) {
        logSuccess('POST /api/auth/register endpoint is working');
        passedAuthChecks++;
        authToken = response.data.token;
        logInfo(`Registered test user with email: ${testEmail}`);
      } else {
        logError(`POST /api/auth/register endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing POST /api/auth/register endpoint: ${err.message}`);
    }
    
    // Test user login
    try {
      logInfo('Testing POST /api/auth/login endpoint...');
      const loginData = {
        email: testEmail,
        password: testPassword
      };
      
      const response = await makeRequest('POST', '/api/auth/login', loginData);
      
      if (response.statusCode === 200 && response.data.success && response.data.token) {
        logSuccess('POST /api/auth/login endpoint is working');
        passedAuthChecks++;
        authToken = response.data.token; // Update token with the one from login
      } else {
        logError(`POST /api/auth/login endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing POST /api/auth/login endpoint: ${err.message}`);
    }
    
    // Test get current user (protected route)
    if (authToken) {
      try {
        logInfo('Testing GET /api/auth/me endpoint (protected route)...');
        const response = await makeRequest('GET', '/api/auth/me', null, authToken);
        
        if (response.statusCode === 200 && response.data.success && response.data.user) {
          logSuccess('GET /api/auth/me endpoint is working (JWT authentication successful)');
          passedAuthChecks++;
        } else {
          logError(`GET /api/auth/me endpoint failed with status code ${response.statusCode}`);
          if (response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing GET /api/auth/me endpoint: ${err.message}`);
      }
    } else {
      logWarning('Skipping GET /api/auth/me test because authentication token was not obtained');
    }
    
    return { passed: passedAuthChecks, total: totalAuthChecks };
  } catch (err) {
    logError(`Error testing authentication endpoints: ${err.message}`);
    return { passed: passedAuthChecks, total: totalAuthChecks };
  }
};

// Function to test API endpoints
const testApiEndpoints = async () => {
  let passedApiChecks = 0;
  let totalApiChecks = 15; // Updated to include team, team member, and service API tests
  let createdChurchId = null;
  let createdEventTypeId = null;
  let createdEventId = null;
  let authToken = null;
  
  try {
    // Check if server is running
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      logError('Server is not running. Please start the server before testing API endpoints.');
      return { passed: 0, total: totalApiChecks };
    }
    
    // First authenticate as an admin user to access protected endpoints
    try {
      logInfo('Authenticating as admin user for protected endpoints...');
      
      // Try to login with admin credentials
      const loginData = {
        email: 'admin@example.com',
        password: 'adminPassword123'
      };
      
      let response = await makeRequest('POST', '/api/auth/login', loginData);
      
      // If admin user doesn't exist, register one
      if (response.statusCode !== 200) {
        logInfo('Admin user not found, registering a new admin user...');
        
        // Connect to MongoDB to delete any existing admin user
        try {
          logInfo('Connecting to MongoDB to ensure clean admin user creation...');
          await mongoose.connect(process.env.MONGO_URI);
          
          // Delete the admin user if it exists (but with wrong role)
          const result = await mongoose.connection.db.collection('users').deleteMany({ email: 'admin@example.com' });
          if (result.deletedCount > 0) {
            logInfo(`Deleted ${result.deletedCount} existing admin user(s) to ensure clean registration`);
          }
          
          await mongoose.disconnect();
          logInfo('Disconnected from MongoDB');
        } catch (dbErr) {
          logWarning(`Error cleaning up admin user: ${dbErr.message}`);
        }
        
        const adminData = {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'adminPassword123',
          role: 'admin',
          churchName: 'Admin Church',
          churchAddress: '123 Admin Street',
          churchCity: 'Admin City',
          churchState: 'AS',
          churchZip: '12345'
        };
        
        logInfo(`Registering admin user with role: ${adminData.role}`);
        
        response = await makeRequest('POST', '/api/auth/register', adminData);
        
        if (response.statusCode === 201 && response.data.success && response.data.token) {
          logSuccess('Admin user registered successfully');
          if (response.data.user && response.data.user.role) {
            logInfo(`User registered with role: ${response.data.user.role}`);
          } else {
            logWarning('User role information not found in response');
          }
          authToken = response.data.token;
        } else {
          logWarning('Failed to register admin user. Some protected endpoints may fail.');
          logInfo(`Registration response: ${JSON.stringify(response.data)}`);
        }
      } else if (response.data.token) {
        logSuccess('Admin user authenticated successfully');
        if (response.data.user && response.data.user.role) {
          logInfo(`Authenticated user role: ${response.data.user.role}`);
          
          // If user exists but doesn't have admin role, delete and recreate
          if (response.data.user.role !== 'admin') {
            logInfo('Existing user does not have admin role. Deleting and recreating...');
            
            try {
              await mongoose.connect(process.env.MONGO_URI);
              
              // Delete the user
              const result = await mongoose.connection.db.collection('users').deleteMany({ email: 'admin@example.com' });
              if (result.deletedCount > 0) {
                logInfo(`Deleted ${result.deletedCount} existing user(s) with incorrect role`);
              }
              
              await mongoose.disconnect();
              
              // Register new admin user
              const adminData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'adminPassword123',
                role: 'admin',
                churchName: 'Admin Church',
                churchAddress: '123 Admin Street',
                churchCity: 'Admin City',
                churchState: 'AS',
                churchZip: '12345'
              };
              
              logInfo(`Registering new admin user with role: ${adminData.role}`);
              
              response = await makeRequest('POST', '/api/auth/register', adminData);
              
              if (response.statusCode === 201 && response.data.success && response.data.token) {
                logSuccess('Admin user registered successfully with admin role');
                authToken = response.data.token;
                if (response.data.user && response.data.user.role) {
                  logInfo(`New user registered with role: ${response.data.user.role}`);
                }
              } else {
                logWarning('Failed to register admin user. Some protected endpoints may fail.');
              }
            } catch (dbErr) {
              logWarning(`Error recreating admin user: ${dbErr.message}`);
            }
          }
        }
        
        if (!authToken) {
          authToken = response.data.token;
        }
      }
    } catch (err) {
      logWarning(`Error authenticating as admin: ${err.message}. Some protected endpoints may fail.`);
    }
    
    // Test GET /api/churches
    try {
      logInfo('Testing GET /api/churches endpoint...');
      const response = await makeRequest('GET', '/api/churches');
      
      if (response.statusCode === 200 && response.data.success) {
        logSuccess('GET /api/churches endpoint is working');
        passedApiChecks++;
      } else {
        logError(`GET /api/churches endpoint failed with status code ${response.statusCode}`);
      }
    } catch (err) {
      logError(`Error testing GET /api/churches endpoint: ${err.message}`);
    }
    
    // Test POST /api/churches (protected - admin only)
    try {
      logInfo('Testing POST /api/churches endpoint (protected - admin only)...');
      const churchData = {
        name: `Test Church ${Date.now()}`,
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        phone: '555-123-4567',
        email: 'test@testchurch.com',
        website: 'https://testchurch.com'
      };
      
      if (authToken) {
        logInfo(`Using auth token: ${authToken.substring(0, 10)}...`);
      } else {
        logWarning('No auth token available for POST /api/churches request');
      }
      
      const response = await makeRequest('POST', '/api/churches', churchData, authToken);
      
      if (response.statusCode === 201 && response.data.success) {
        logSuccess('POST /api/churches endpoint is working');
        passedApiChecks++;
        createdChurchId = response.data.data._id;
        logInfo(`Created test church with ID: ${createdChurchId}`);
      } else {
        logError(`POST /api/churches endpoint failed with status code ${response.statusCode}`);
        if (response.statusCode === 401 || response.statusCode === 403) {
          logError('Authentication required: Make sure you have admin privileges');
        }
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
        logInfo(`Full response: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      logError(`Error testing POST /api/churches endpoint: ${err.message}`);
    }
    
    // If we have a church ID, test the other endpoints
    if (createdChurchId) {
      // Test GET /api/churches/:id
      try {
        logInfo(`Testing GET /api/churches/${createdChurchId} endpoint...`);
        const response = await makeRequest('GET', `/api/churches/${createdChurchId}`);
        
        if (response.statusCode === 200 && response.data.success) {
          logSuccess(`GET /api/churches/${createdChurchId} endpoint is working`);
          passedApiChecks++;
        } else {
          logError(`GET /api/churches/${createdChurchId} endpoint failed with status code ${response.statusCode}`);
        }
      } catch (err) {
        logError(`Error testing GET /api/churches/${createdChurchId} endpoint: ${err.message}`);
      }
      
      // Test PUT /api/churches/:id (protected - admin only)
      try {
        logInfo(`Testing PUT /api/churches/${createdChurchId} endpoint (protected - admin only)...`);
        const updatedChurchData = {
          name: `Updated Test Church ${Date.now()}`,
          address: '456 Updated Street',
          city: 'Updated City',
          state: 'UC',
          zip: '54321'
        };
        
        const response = await makeRequest('PUT', `/api/churches/${createdChurchId}`, updatedChurchData, authToken);
        
        if (response.statusCode === 200 && response.data.success) {
          logSuccess(`PUT /api/churches/${createdChurchId} endpoint is working`);
          passedApiChecks++;
        } else {
          logError(`PUT /api/churches/${createdChurchId} endpoint failed with status code ${response.statusCode}`);
          if (response.statusCode === 401 || response.statusCode === 403) {
            logError('Authentication required: Make sure you have admin privileges');
          }
          if (response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing PUT /api/churches/${createdChurchId} endpoint: ${err.message}`);
      }
      
      // Test DELETE /api/churches/:id (protected - admin only)
      try {
        logInfo(`Testing DELETE /api/churches/${createdChurchId} endpoint (protected - admin only)...`);
        const response = await makeRequest('DELETE', `/api/churches/${createdChurchId}`, null, authToken);
        
        if (response.statusCode === 200 && response.data.success) {
          logSuccess(`DELETE /api/churches/${createdChurchId} endpoint is working`);
          passedApiChecks++;
        } else {
          logError(`DELETE /api/churches/${createdChurchId} endpoint failed with status code ${response.statusCode}`);
          if (response.statusCode === 401 || response.statusCode === 403) {
            logError('Authentication required: Make sure you have admin privileges');
          }
          if (response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing DELETE /api/churches/${createdChurchId} endpoint: ${err.message}`);
      }
    } else {
      logWarning('Skipping GET, PUT, and DELETE church endpoint tests because church creation failed');
    }
    
    // Test Event Type endpoints
    // Test GET /api/event-types (protected)
    try {
      logInfo('Testing GET /api/event-types endpoint (protected)...');
      const response = await makeRequest('GET', '/api/event-types', null, authToken);
      
      if (response.statusCode === 200 && response.data.success) {
        logSuccess('GET /api/event-types endpoint is working');
        passedApiChecks++;
      } else {
        logError(`GET /api/event-types endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing GET /api/event-types endpoint: ${err.message}`);
    }
    
    // Test POST /api/event-types (protected)
    try {
      logInfo('Testing POST /api/event-types endpoint (protected)...');
      const eventTypeData = {
        name: `Test Event Type ${Date.now()}`,
        color: '#FF5733',
        description: 'A test event type for validation'
      };
      
      const response = await makeRequest('POST', '/api/event-types', eventTypeData, authToken);
      
      if (response.statusCode === 201 && response.data.success) {
        logSuccess('POST /api/event-types endpoint is working');
        passedApiChecks++;
        createdEventTypeId = response.data.data._id;
        logInfo(`Created test event type with ID: ${createdEventTypeId}`);
      } else {
        logError(`POST /api/event-types endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing POST /api/event-types endpoint: ${err.message}`);
    }
    
    // Test Event endpoints (if we have an event type)
    if (createdEventTypeId) {
      // Test GET /api/events (protected)
      try {
        logInfo('Testing GET /api/events endpoint (protected)...');
        const response = await makeRequest('GET', '/api/events', null, authToken);
        
        if (response.statusCode === 200 && response.data.success) {
          logSuccess('GET /api/events endpoint is working');
          passedApiChecks++;
        } else {
          logError(`GET /api/events endpoint failed with status code ${response.statusCode}`);
          if (response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing GET /api/events endpoint: ${err.message}`);
      }
      
      // Test POST /api/events (protected)
      try {
        logInfo('Testing POST /api/events endpoint (protected)...');
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const eventData = {
          title: `Test Event ${Date.now()}`,
          description: 'A test event for validation',
          start: now.toISOString(),
          end: tomorrow.toISOString(),
          location: 'Test Location',
          eventType: createdEventTypeId,
          allDay: false
        };
        
        const response = await makeRequest('POST', '/api/events', eventData, authToken);
        
        if (response.statusCode === 201 && response.data.success) {
          logSuccess('POST /api/events endpoint is working');
          passedApiChecks++;
          createdEventId = response.data.data._id;
          logInfo(`Created test event with ID: ${createdEventId}`);
        } else {
          logError(`POST /api/events endpoint failed with status code ${response.statusCode}`);
          if (response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing POST /api/events endpoint: ${err.message}`);
      }
    } else {
      logWarning('Skipping event endpoint tests because event type creation failed');
    }
    
    // Test Team API endpoints
    logHeader('Testing Team API Endpoints');
    
    // Test GET /api/teams
    try {
      logInfo('Testing GET /api/teams endpoint...');
      
      const response = await makeRequest('GET', '/api/teams', null, authToken);
      
      if (response.statusCode === 200 && response.data.success) {
        logSuccess('GET /api/teams endpoint is working');
        passedApiChecks++;
      } else {
        logError(`GET /api/teams endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing GET /api/teams endpoint: ${err.message}`);
    }
    
    // Test POST /api/teams
    let createdTeamId = null;
    try {
      logInfo('Testing POST /api/teams endpoint...');
      
      const teamData = {
        name: 'Test Team',
        description: 'A team created for testing purposes'
      };
      
      const response = await makeRequest('POST', '/api/teams', teamData, authToken);
      
      if (response.statusCode === 201 && response.data.success) {
        logSuccess('POST /api/teams endpoint is working');
        passedApiChecks++;
        createdTeamId = response.data.data._id;
        logInfo(`Created test team with ID: ${createdTeamId}`);
      } else {
        logError(`POST /api/teams endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing POST /api/teams endpoint: ${err.message}`);
    }
    
    // Test Team Member API endpoints if team was created
    if (createdTeamId) {
      logHeader('Testing Team Member API Endpoints');
      
      // Test POST /api/teams/:teamId/members
      let createdTeamMemberId = null;
      try {
        logInfo('Testing POST /api/teams/:teamId/members endpoint...');
        
        // Get the current user's ID from the auth token
        const userData = await makeRequest('GET', '/api/auth/me', null, authToken);
        
        // Add proper error handling for the user data
        if (!userData.data || !userData.data.success) {
          logError('Failed to get user data from /api/auth/me');
          if (userData.data && userData.data.error) {
            logError(`Error message: ${userData.data.error}`);
          }
          logWarning('Skipping team member creation test due to missing user data');
        } 
        // Check for user ID in the correct location in the response
        else if (!userData.data.user || !userData.data.user.id) {
          logError('User ID not found in /api/auth/me response');
          logInfo('Response structure: ' + JSON.stringify(userData.data, null, 2));
          logWarning('Skipping team member creation test due to missing user ID');
        }
        else {
          const userId = userData.data.user.id;
          logInfo(`Using user ID: ${userId} for team member creation`);
          
          const teamMemberData = {
            user: userId,
            role: 'Leader'
          };
          
          const response = await makeRequest('POST', `/api/teams/${createdTeamId}/members`, teamMemberData, authToken);
          
          if (response.statusCode === 201 && response.data.success) {
            logSuccess('POST /api/teams/:teamId/members endpoint is working');
            passedApiChecks++;
            createdTeamMemberId = response.data.data._id;
            logInfo(`Added team member with ID: ${createdTeamMemberId}`);
          } else {
            logError(`POST /api/teams/:teamId/members endpoint failed with status code ${response.statusCode}`);
            if (response.data.error) {
              logError(`Error message: ${response.data.error}`);
            }
          }
        }
      } catch (err) {
        logError(`Error testing POST /api/teams/:teamId/members endpoint: ${err.message}`);
      }
      
      // Test GET /api/teams/:teamId/members
      try {
        logInfo('Testing GET /api/teams/:teamId/members endpoint...');
        
        const response = await makeRequest('GET', `/api/teams/${createdTeamId}/members`, null, authToken);
        
        // Check if the response is valid JSON
        if (typeof response.data === 'string') {
          logError('Received non-JSON response from /api/teams/:teamId/members endpoint');
          logInfo('Response starts with: ' + response.data.substring(0, 50) + '...');
          logError('This usually indicates a server error or route not found');
          passedApiChecks--; // Decrement because this test is counted in totalApiChecks
        } else if (response.statusCode === 200 && response.data.success) {
          logSuccess('GET /api/teams/:teamId/members endpoint is working');
          passedApiChecks++;
        } else {
          logError(`GET /api/teams/:teamId/members endpoint failed with status code ${response.statusCode}`);
          if (response.data && response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing GET /api/teams/:teamId/members endpoint: ${err.message}`);
      }
    } else {
      logWarning('Skipping team member endpoint tests because team creation failed');
    }
    
    // Test Service API endpoints
    logHeader('Testing Service API Endpoints');
    
    // Test GET /api/services
    try {
      logInfo('Testing GET /api/services endpoint...');
      
      const response = await makeRequest('GET', '/api/services', null, authToken);
      
      if (response.statusCode === 200 && response.data.success) {
        logSuccess('GET /api/services endpoint is working');
        passedApiChecks++;
      } else {
        logError(`GET /api/services endpoint failed with status code ${response.statusCode}`);
        if (response.data.error) {
          logError(`Error message: ${response.data.error}`);
        }
      }
    } catch (err) {
      logError(`Error testing GET /api/services endpoint: ${err.message}`);
    }
    
    // Test POST /api/services
    if (createdEventId) {
      try {
        logInfo('Testing POST /api/services endpoint...');
        
        const serviceData = {
          title: 'Test Service',
          date: new Date().toISOString(),
          description: 'A service created for testing purposes',
          event: createdEventId,
          items: [
            {
              order: 1,
              title: 'Welcome',
              type: 'other',
              duration: 5,
              notes: 'Welcome everyone to the service'
            },
            {
              order: 2,
              title: 'Announcements',
              type: 'announcement',
              duration: 5,
              notes: 'Share upcoming events'
            }
          ]
        };
        
        const response = await makeRequest('POST', '/api/services', serviceData, authToken);
        
        if (response.statusCode === 201 && response.data.success) {
          logSuccess('POST /api/services endpoint is working');
          passedApiChecks++;
          const createdServiceId = response.data.data._id;
          logInfo(`Created test service with ID: ${createdServiceId}`);
        } else {
          logError(`POST /api/services endpoint failed with status code ${response.statusCode}`);
          if (response.data.error) {
            logError(`Error message: ${response.data.error}`);
          }
        }
      } catch (err) {
        logError(`Error testing POST /api/services endpoint: ${err.message}`);
      }
    } else {
      logWarning('Skipping service creation test because event creation failed');
    }
    
    return { passed: passedApiChecks, total: totalApiChecks };
  } catch (err) {
    logError(`Error testing API endpoints: ${err.message}`);
    return { passed: passedApiChecks, total: totalApiChecks };
  }
};

// Main validation function
async function validateProjectSetup() {
  let passedChecks = 0;
  let totalChecks = 0;
  
  logHeader('Church Planner v2 - Project Setup Validation');
  
  // Check project structure
  logHeader('Checking Project Structure');
  
  totalChecks++;
  if (dirExists(path.join(__dirname, 'client'))) {
    logSuccess('Client directory exists');
    passedChecks++;
  } else {
    logError('Client directory not found');
  }
  
  totalChecks++;
  if (dirExists(path.join(__dirname, 'server'))) {
    logSuccess('Server directory exists');
    passedChecks++;
  } else {
    logError('Server directory not found');
  }
  
  // Check client setup
  logHeader('Checking Client Setup');
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'client', 'package.json'))) {
    logSuccess('Client package.json exists');
    passedChecks++;
  } else {
    logError('Client package.json not found');
  }
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'client', 'vite.config.ts'))) {
    logSuccess('Vite configuration exists');
    passedChecks++;
  } else {
    logError('Vite configuration not found');
  }
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'client', 'tailwind.config.js'))) {
    logSuccess('Tailwind CSS configuration exists');
    passedChecks++;
  } else {
    logError('Tailwind CSS configuration not found');
  }
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'client', '.prettierrc'))) {
    logSuccess('Prettier configuration exists');
    passedChecks++;
  } else {
    logError('Prettier configuration not found');
  }
  
  // Check server setup
  logHeader('Checking Server Setup');
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'server', 'package.json'))) {
    logSuccess('Server package.json exists');
    passedChecks++;
  } else {
    logError('Server package.json not found');
  }
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'server', 'tsconfig.json'))) {
    logSuccess('TypeScript configuration exists');
    passedChecks++;
  } else {
    logError('TypeScript configuration not found');
  }
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'server', '.env'))) {
    logSuccess('Environment variables file exists');
    passedChecks++;
  } else {
    logError('Environment variables file not found');
  }
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'server', '.gitignore'))) {
    logSuccess('Server .gitignore exists');
    passedChecks++;
  } else {
    logError('Server .gitignore not found');
  }
  
  // Check dependencies
  logHeader('Checking Dependencies');
  
  // Client dependencies
  totalChecks++;
  if (packageInstalled('react', 'client')) {
    logSuccess('React is installed');
    passedChecks++;
  } else {
    logError('React is not installed');
  }
  
  totalChecks++;
  if (packageInstalled('tailwindcss', 'client')) {
    logSuccess('Tailwind CSS is installed');
    passedChecks++;
  } else {
    logError('Tailwind CSS is not installed');
  }
  
  // Server dependencies
  totalChecks++;
  if (packageInstalled('express', 'server')) {
    logSuccess('Express is installed');
    passedChecks++;
  } else {
    logError('Express is not installed');
  }
  
  totalChecks++;
  if (packageInstalled('mongoose', 'server')) {
    logSuccess('Mongoose is installed');
    passedChecks++;
  } else {
    logError('Mongoose is not installed');
  }
  
  totalChecks++;
  if (packageInstalled('jsonwebtoken', 'server')) {
    logSuccess('JWT is installed');
    passedChecks++;
  } else {
    logError('JWT is not installed');
  }
  
  // Check Docker and MongoDB
  logHeader('Checking Docker and MongoDB');
  
  totalChecks++;
  if (fileExists(path.join(__dirname, 'docker-compose.yml'))) {
    logSuccess('Docker Compose configuration exists');
    passedChecks++;
  } else {
    logError('Docker Compose configuration not found');
  }
  
  totalChecks++;
  if (isDockerRunning()) {
    logSuccess('Docker is running');
    passedChecks++;
  } else {
    logError('Docker is not running');
  }
  
  totalChecks++;
  if (isMongoDBRunning()) {
    logSuccess('MongoDB container is running');
    passedChecks++;
  } else {
    logError('MongoDB container is not running');
  }
  
  // Test MongoDB connection
  logHeader('Testing MongoDB Connection');
  
  totalChecks++;
  if (await testMongoDBConnection()) {
    passedChecks++;
  }
  
  // Test API endpoints
  logHeader('Testing API Endpoints');
  
  const apiResults = await testApiEndpoints();
  totalChecks += apiResults.total;
  passedChecks += apiResults.passed;
  
  // Test JWT Authentication
  logHeader('Testing JWT Authentication System');
  
  const authResults = await testAuthEndpoints();
  totalChecks += authResults.total;
  passedChecks += authResults.passed;
  
  // Summary
  logHeader('Validation Summary');
  
  const passPercentage = Math.round((passedChecks / totalChecks) * 100);
  
  console.log(`Passed ${passedChecks} out of ${totalChecks} checks (${passPercentage}%)`);
  
  if (passPercentage === 100) {
    logSuccess('All checks passed! Your project setup is complete.');
  } else if (passPercentage >= 80) {
    logWarning('Most checks passed. Fix the remaining issues to complete your setup.');
  } else {
    logError('Several checks failed. Please address the issues before continuing.');
  }
}

// Run the validation
validateProjectSetup().catch(err => {
  logError(`An error occurred during validation: ${err.message}`);
  process.exit(1);
}); 