#!/usr/bin/env node

/**
 * Main script to run all code quality checks
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running all code quality checks...');

const scripts = [
  // Update ESLint rules to enforce type safety
  'code-quality/eslint-typescript.js',
  
  // Set up pre-commit hooks
  'code-quality/setup-hooks.js',
  
  // Generate code quality reports
  'code-quality/generate-reports.js',
  
  // Detect code smells and type safety issues
  'code-quality/code-smells.js',
  
  // Track improvements over time
  'code-quality/track-improvements.js'
];

scripts.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  console.log(`\n📝 Running ${script}...`);
  
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    console.log(`✅ ${script} completed successfully`);
  } catch (error) {
    console.error(`❌ Error running ${script}:`, error.message);
  }
});

console.log('\n🎉 Code quality checks completed!');
console.log('\nYou can now run code quality checks regularly with:');
console.log('  npm run quality');
console.log('\nPre-commit hooks will also run checks automatically before each commit.');
console.log('\nView visualizations and trends in the reports directory.');
console.log('\nAdditional reports generated:');
console.log('  - Type coverage report: reports/type-coverage-summary.md');
console.log('  - ESLint issues: reports/eslint-*-summary.md');
console.log('  - Code smells report: reports/code-smells.md');
console.log('  - Quality trends visualization: reports/quality-trends.html'); 