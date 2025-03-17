#!/usr/bin/env node

/**
 * Script to check TypeScript type coverage using type-coverage
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MIN_COVERAGE = 90; // Minimum required type coverage percentage
const REPORT_FILE = path.join(__dirname, '../../reports/type-coverage.json');
const SUMMARY_FILE = path.join(__dirname, '../../reports/type-coverage-summary.md');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('Checking if type-coverage is installed...');
try {
  // Check if type-coverage is installed globally
  execSync('type-coverage --version', { stdio: 'ignore' });
} catch (error) {
  console.log('Installing type-coverage...');
  // Install type-coverage if not already installed
  execSync('npm install -g type-coverage', { stdio: 'inherit' });
}

// Array of projects to check
const projects = [
  { name: 'Server', path: 'server', tsconfig: 'server/tsconfig.json' },
  { name: 'Client', path: 'client', tsconfig: 'client/tsconfig.app.json' }
];

// Store results for each project
const results = [];

// Check each project
projects.forEach(project => {
  console.log(`\nChecking type coverage for ${project.name}...`);
  
  try {
    // Run type-coverage and get the output
    const output = execSync(
      `npx type-coverage --detail --project ${project.tsconfig}`,
      { encoding: 'utf8' }
    );
    
    // Parse the coverage percentage from the output
    const coverageMatch = output.match(/([0-9.]+)%/);
    const percentage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    
    // Parse any problematic files
    const files = [];
    const lines = output.split('\n');
    let currentFile = null;
    
    for (const line of lines) {
      if (line.includes('.ts') && line.includes(':')) {
        // This is a file path
        currentFile = {
          path: line.trim(),
          issues: []
        };
        files.push(currentFile);
      } else if (currentFile && line.trim().startsWith('- ')) {
        // This is an issue in a file
        currentFile.issues.push(line.trim());
      }
    }
    
    // Add result to array
    results.push({
      project: project.name,
      coverage: percentage,
      passing: percentage >= MIN_COVERAGE,
      files
    });
    
    // Log the result
    console.log(`Coverage: ${percentage.toFixed(2)}% (Minimum required: ${MIN_COVERAGE}%)`);
    if (percentage < MIN_COVERAGE) {
      console.log(`❌ Coverage is below the required ${MIN_COVERAGE}%`);
    } else {
      console.log(`✅ Coverage meets the required ${MIN_COVERAGE}%`);
    }
    
    console.log(`Files with type issues: ${files.length}`);
    
  } catch (error) {
    console.error(`Error checking type coverage for ${project.name}:`, error.message);
    results.push({
      project: project.name,
      coverage: 0,
      passing: false,
      error: error.message,
      files: []
    });
  }
});

// Generate a markdown summary
let summary = `# TypeScript Type Coverage Report\n\n`;
summary += `Report generated on: ${new Date().toLocaleString()}\n\n`;
summary += `| Project | Coverage | Status | Issues |\n`;
summary += `|---------|----------|--------|--------|\n`;

results.forEach(result => {
  const status = result.passing ? '✅ PASS' : '❌ FAIL';
  const issueCount = result.files.reduce((count, file) => count + file.issues.length, 0);
  summary += `| ${result.project} | ${result.coverage.toFixed(2)}% | ${status} | ${issueCount} |\n`;
});

summary += `\n## Detailed Issues\n\n`;

results.forEach(result => {
  if (result.files.length > 0) {
    summary += `### ${result.project}\n\n`;
    
    result.files.forEach(file => {
      summary += `#### ${file.path}\n\n`;
      file.issues.forEach(issue => {
        summary += `${issue}\n\n`;
      });
    });
  }
});

// Save results to files
fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
fs.writeFileSync(SUMMARY_FILE, summary);

console.log(`\nReport saved to ${SUMMARY_FILE}`);

// Determine overall pass/fail
const allPassing = results.every(result => result.passing);
if (!allPassing) {
  console.error(`\n❌ Type coverage requirements not met. See ${SUMMARY_FILE} for details.`);
  process.exit(1);
} else {
  console.log(`\n✅ All projects meet type coverage requirements.`);
} 