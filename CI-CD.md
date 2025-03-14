# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline set up for the Church Planner application using GitHub Actions.

## Overview

The CI/CD pipeline automates the following processes:
- Code quality checks (linting, formatting, type checking)
- Running tests
- Building the application
- API validation
- (Future) Deployment to staging and production environments

## Workflow Files

The pipeline is defined in the following GitHub Actions workflow files:

### 1. `main.yml`

**Purpose**: Main CI/CD pipeline that runs tests and builds the application.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:
- `test-and-build`: Runs tests and builds the application
- `deploy-staging`: (Commented out) Will deploy to staging environment when enabled
- `deploy-production`: (Commented out) Will deploy to production environment when enabled

### 2. `api-validation.yml`

**Purpose**: Validates the API endpoints using the project_setup.js script.

**Triggers**:
- Push to `main` or `develop` branches that modify server code or the validation script
- Pull requests to `main` or `develop` branches that modify server code or the validation script
- Manual trigger via GitHub Actions UI

**Jobs**:
- `validate-api`: Starts the server and runs the API validation script

### 3. `code-quality.yml`

**Purpose**: Performs code quality checks.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via GitHub Actions UI

**Jobs**:
- `code-quality`: Runs linting, type checking, and (in the future) test coverage reporting

## Environment Setup

The workflows use the following environment setup:

- **Node.js**: Version 16
- **MongoDB**: Version 4.4 (runs as a service container)
- **Environment Variables**:
  - `MONGO_URI`: Connection string for MongoDB
  - `JWT_SECRET`: Secret key for JWT token generation
  - `JWT_EXPIRE`: JWT token expiration time

## Future Enhancements

The following enhancements are planned for the CI/CD pipeline:

1. **Test Coverage Reporting**:
   - Implement test coverage reporting using Jest and Codecov
   - Set up coverage thresholds to maintain code quality

2. **Automated Deployment**:
   - Configure deployment to staging environment for the `develop` branch
   - Configure deployment to production environment for the `main` branch
   - Implement blue/green deployment strategy

3. **Performance Testing**:
   - Add performance testing to ensure the application meets performance requirements
   - Set up load testing for API endpoints

4. **Security Scanning**:
   - Implement security scanning to identify vulnerabilities
   - Add dependency scanning to check for vulnerable packages

## Usage

### Running Workflows Manually

1. Go to the "Actions" tab in the GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Select the branch to run the workflow on
5. Click "Run workflow"

### Viewing Workflow Results

1. Go to the "Actions" tab in the GitHub repository
2. Click on the workflow run you want to view
3. View the results of each job and step

### Troubleshooting

If a workflow fails, check the following:

1. **Dependencies**: Ensure all dependencies are correctly specified in package.json
2. **Scripts**: Verify that the scripts referenced in the workflow exist in package.json
3. **Environment Variables**: Check that all required environment variables are set
4. **MongoDB Connection**: Verify that the MongoDB connection string is correct
5. **Permissions**: Ensure the GitHub Actions runner has the necessary permissions 