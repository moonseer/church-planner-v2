#!/usr/bin/env node

/**
 * Script to set up Git pre-commit hooks for code quality checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const HOOKS_DIR = path.join(__dirname, '../../.git/hooks');
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, 'pre-commit');

console.log('Setting up Git pre-commit hooks for code quality checks...');

// Check if Git hooks directory exists
if (!fs.existsSync(HOOKS_DIR)) {
  console.error('Git hooks directory not found. Make sure this is a Git repository.');
  process.exit(1);
}

// Install husky and lint-staged if they're not already installed
console.log('\n📦 Checking if husky and lint-staged are installed...');
try {
  execSync('npm list -g husky lint-staged', { stdio: 'ignore' });
} catch (error) {
  console.log('Installing husky and lint-staged...');
  execSync('npm install -g husky lint-staged', { stdio: 'inherit' });
}

// Set up husky
console.log('\n🐶 Setting up husky...');
try {
  execSync('npx husky install', { stdio: 'inherit' });
  console.log('✅ Husky installed successfully');
} catch (error) {
  console.error('❌ Error setting up husky:', error.message);
  process.exit(1);
}

// Create pre-commit hook
console.log('\n🔒 Creating pre-commit hook...');
const preCommitScript = `#!/bin/sh

# Pre-commit hook for code quality checks

echo "🔍 Running code quality checks..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo "No TypeScript files staged for commit."
  exit 0
fi

# Run ESLint on staged files
echo "\\n📝 Running ESLint..."
npx eslint $STAGED_FILES --quiet
if [ $? -ne 0 ]; then
  echo "\\n❌ ESLint found issues. Please fix them before committing."
  exit 1
fi

# Run TypeScript compiler on staged files
echo "\\n🔍 Running TypeScript compiler..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "\\n❌ TypeScript found issues. Please fix them before committing."
  exit 1
fi

# All checks passed
echo "\\n✅ All code quality checks passed!"
exit 0
`;

try {
  fs.writeFileSync(PRE_COMMIT_HOOK, preCommitScript);
  fs.chmodSync(PRE_COMMIT_HOOK, '755'); // Make executable
  console.log('✅ Pre-commit hook created successfully');
} catch (error) {
  console.error('❌ Error creating pre-commit hook:', error.message);
  process.exit(1);
}

// Add lint-staged configuration to package.json
console.log('\n📝 Adding lint-staged configuration to package.json...');
const rootPackageJsonPath = path.join(__dirname, '../../package.json');

if (fs.existsSync(rootPackageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
    
    // Add husky and lint-staged configurations
    packageJson.husky = packageJson.husky || {};
    packageJson.husky.hooks = packageJson.husky.hooks || {};
    packageJson.husky.hooks['pre-commit'] = 'lint-staged';
    
    packageJson['lint-staged'] = packageJson['lint-staged'] || {
      '*.{ts,tsx}': [
        'eslint --fix',
        'prettier --write',
        'git add'
      ]
    };
    
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ lint-staged configuration added to package.json');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
} else {
  console.log('⚠️ Root package.json not found');
}

// Create an npm script to run code quality checks
console.log('\n📝 Adding code quality check scripts to package.json...');

// List of package.json files to update
const packageJsonFiles = [
  path.join(__dirname, '../../package.json'),
  path.join(__dirname, '../../client/package.json'),
  path.join(__dirname, '../../server/package.json')
];

packageJsonFiles.forEach(packageJsonPath => {
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add code quality scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['quality'] = packageJson.scripts['quality'] || 'node scripts/code-quality/generate-reports.js';
      packageJson.scripts['lint:ts'] = packageJson.scripts['lint:ts'] || 'eslint --ext .ts,.tsx .';
      packageJson.scripts['check:types'] = packageJson.scripts['check:types'] || 'tsc --noEmit';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Scripts added to ${packageJsonPath}`);
    } catch (error) {
      console.error(`❌ Error updating ${packageJsonPath}:`, error.message);
    }
  }
});

console.log('\n🎉 Pre-commit hooks set up successfully!');
console.log('Git will now run code quality checks before each commit.');
console.log('\nYou can also run code quality checks manually:');
console.log('  npm run quality         # Generate code quality reports');
console.log('  npm run lint:ts         # Run ESLint on TypeScript files');
console.log('  npm run check:types     # Run TypeScript compiler without emitting output'); 