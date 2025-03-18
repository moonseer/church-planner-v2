/**
 * API Test Script
 * 
 * This is a simple script to test the API routes of our Church Planner application.
 * It makes HTTP requests to the API endpoints and logs the responses.
 * 
 * Usage:
 * 1. Make sure the server is running
 * 2. Run this script with Node.js:
 *    node api-test.js
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let churchId = '';

// Utility for making requests
const api = {
  async fetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    return { status: response.status, data };
  },

  async get(endpoint) {
    return this.fetch(endpoint, { method: 'GET' });
  },

  async post(endpoint, body) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async put(endpoint, body) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(endpoint) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }
};

// Test functions
async function testRegister() {
  console.log('\n==== Testing Register ====');
  
  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
  };

  const response = await api.post('/auth/register', userData);
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
  
  if (response.data.success) {
    token = response.data.token;
    userId = response.data.user._id;
    console.log('Registration successful! Token acquired.');
  } else {
    console.error('Registration failed:', response.data.error);
  }
}

async function testLogin() {
  console.log('\n==== Testing Login ====');
  
  const credentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  const response = await api.post('/auth/login', credentials);
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
  
  if (response.data.success) {
    token = response.data.token;
    userId = response.data.user._id;
    console.log('Login successful! Token acquired.');
  } else {
    console.error('Login failed:', response.data.error);
  }
}

async function testGetCurrentUser() {
  console.log('\n==== Testing Get Current User ====');
  
  const response = await api.get('/auth/me');
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
}

async function testCreateChurch() {
  console.log('\n==== Testing Create Church ====');
  
  const churchData = {
    name: `Test Church ${Date.now()}`,
    description: 'A test church',
    location: {
      address: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA'
    },
    contact: {
      phone: '555-123-4567',
      email: 'church@example.com',
      website: 'https://testchurch.com'
    },
    denomination: 'Test Denomination',
    pastorName: 'Pastor Test',
    serviceTime: 'Sundays at 10:00 AM'
  };

  const response = await api.post('/churches', churchData);
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
  
  if (response.data.success) {
    churchId = response.data.church._id;
    console.log('Church created successfully!');
  } else {
    console.error('Failed to create church:', response.data.error);
  }
}

async function testGetChurches() {
  console.log('\n==== Testing Get All Churches ====');
  
  const response = await api.get('/churches');
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
  
  if (response.data.success && response.data.churches.length > 0) {
    churchId = response.data.churches[0]._id;
    console.log(`Using church ID: ${churchId}`);
  }
}

async function testGetMyChurches() {
  console.log('\n==== Testing Get My Churches ====');
  
  const response = await api.get('/churches/my-churches');
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
}

async function testCreateChurchMember() {
  if (!churchId) {
    console.error('No church ID available. Cannot create member.');
    return;
  }

  console.log('\n==== Testing Create Church Member ====');
  
  const memberData = {
    firstName: `John${Date.now()}`,
    lastName: 'Doe',
    email: `john${Date.now()}@example.com`,
    phone: '555-987-6543',
    gender: 'Male',
    membershipStatus: 'Member',
    address: {
      street: '456 Member Street',
      city: 'Member City',
      state: 'MC',
      zipCode: '54321',
      country: 'USA'
    }
  };

  const response = await api.post(`/churches/${churchId}/members`, memberData);
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
}

async function testGetChurchMembers() {
  if (!churchId) {
    console.error('No church ID available. Cannot get members.');
    return;
  }

  console.log('\n==== Testing Get Church Members ====');
  
  const response = await api.get(`/churches/${churchId}/members`);
  console.log(`Status: ${response.status}`);
  console.log('Response:', response.data);
}

// Main test function
async function runTests() {
  try {
    console.log('Starting API tests...');
    
    // Authentication tests
    await testRegister();
    // Uncomment to test login with existing credentials
    // await testLogin();
    await testGetCurrentUser();
    
    // Church tests
    await testCreateChurch();
    await testGetChurches();
    await testGetMyChurches();
    
    // Church member tests
    await testCreateChurchMember();
    await testGetChurchMembers();
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Run the tests
runTests(); 