#!/usr/bin/env node

/**
 * Script to generate code quality reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPORTS_DIR = path.join(__dirname, '../../reports');
const PROJECTS = ['server', 'client'];

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Run a command and capture the output
 */
function runCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (options.ignoreErrors) {
      return error.stdout || '';
    }
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    if (error.stdout) console.error(error.stdout);
    if (error.stderr) console.error(error.stderr);
    if (!options.continueOnError) {
      process.exit(1);
    }
    return '';
  }
}

console.log('Generating code quality reports...');

// Generate ESLint reports
console.log('\n📊 Generating ESLint reports...');
PROJECTS.forEach(project => {
  console.log(`\nRunning ESLint for ${project}...`);
  
  const outputFile = path.join(REPORTS_DIR, `eslint-${project}.json`);
  const sourceDir = path.join(__dirname, `../../${project}`);
  
  if (!fs.existsSync(sourceDir)) {
    console.log(`⚠️ Project directory not found: ${sourceDir}`);
    return;
  }
  
  const command = `cd ${sourceDir} && npx eslint --ext .ts,.tsx --format json . > ${outputFile}`;
  runCommand(command, { shell: true, continueOnError: true, silent: true });
  
  if (fs.existsSync(outputFile)) {
    try {
      const report = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      const errorCount = report.reduce((count, file) => count + file.errorCount, 0);
      const warningCount = report.reduce((count, file) => count + file.warningCount, 0);
      
      console.log(`${project}: ${errorCount} errors, ${warningCount} warnings`);
      
      // Generate a markdown summary
      const summaryFile = path.join(REPORTS_DIR, `eslint-${project}-summary.md`);
      let summary = `# ESLint Report for ${project}\n\n`;
      summary += `Generated on: ${new Date().toLocaleString()}\n\n`;
      summary += `- Total Errors: ${errorCount}\n`;
      summary += `- Total Warnings: ${warningCount}\n\n`;
      
      if (errorCount + warningCount > 0) {
        summary += `## Issues by File\n\n`;
        
        report.forEach(file => {
          if (file.errorCount + file.warningCount > 0) {
            summary += `### ${file.filePath.replace(sourceDir, '')}\n\n`;
            summary += `- Errors: ${file.errorCount}\n`;
            summary += `- Warnings: ${file.warningCount}\n\n`;
            
            if (file.messages.length > 0) {
              summary += `| Line | Column | Severity | Message | Rule |\n`;
              summary += `|------|--------|----------|---------|------|\n`;
              
              file.messages.forEach(message => {
                const severity = message.severity === 2 ? '❌ Error' : '⚠️ Warning';
                summary += `| ${message.line} | ${message.column} | ${severity} | ${message.message} | ${message.ruleId || 'N/A'} |\n`;
              });
              
              summary += `\n`;
            }
          }
        });
      } else {
        summary += `✅ No issues found!\n`;
      }
      
      fs.writeFileSync(summaryFile, summary);
      console.log(`Report saved to ${summaryFile}`);
      
    } catch (error) {
      console.error(`Error processing ESLint report for ${project}:`, error.message);
    }
  }
});

// Generate TypeScript type coverage reports
console.log('\n📊 Generating TypeScript type coverage reports...');
runCommand(`node ${path.join(__dirname, 'type-coverage.js')}`, { continueOnError: true });

// Generate final summary
console.log('\n📄 Generating final summary...');

const summaryFile = path.join(REPORTS_DIR, 'code-quality-summary.md');
let summary = `# Code Quality Summary Report\n\n`;
summary += `Report generated on: ${new Date().toLocaleString()}\n\n`;

// Check if type coverage report exists
const typeCoverageSummary = path.join(REPORTS_DIR, 'type-coverage-summary.md');
if (fs.existsSync(typeCoverageSummary)) {
  summary += `## TypeScript Type Coverage\n\n`;
  const typeCoverageContent = fs.readFileSync(typeCoverageSummary, 'utf8');
  const typeCoverageTable = typeCoverageContent.match(/\| Project.*?\n\|.*?\n(\|.*?\n)+/s);
  
  if (typeCoverageTable) {
    summary += typeCoverageTable[0] + '\n';
  } else {
    summary += 'No type coverage data available.\n\n';
  }
}

// Add ESLint summaries
summary += `## ESLint Issues\n\n`;
PROJECTS.forEach(project => {
  const eslintSummaryFile = path.join(REPORTS_DIR, `eslint-${project}-summary.md`);
  
  if (fs.existsSync(eslintSummaryFile)) {
    const eslintSummary = fs.readFileSync(eslintSummaryFile, 'utf8');
    const issueCount = eslintSummary.match(/- Total Errors: (\d+)\n- Total Warnings: (\d+)/);
    
    if (issueCount) {
      summary += `### ${project}\n\n`;
      summary += `- Errors: ${issueCount[1]}\n`;
      summary += `- Warnings: ${issueCount[2]}\n\n`;
    }
  } else {
    summary += `### ${project}\n\n`;
    summary += 'No ESLint data available.\n\n';
  }
});

// Add recommendations
summary += `## Recommendations\n\n`;
summary += `1. Fix all type errors and ESLint errors to improve code quality.\n`;
summary += `2. Implement tests for untested functions to improve test coverage.\n`;
summary += `3. Run code quality checks regularly as part of development workflow.\n`;
summary += `4. Consider setting up pre-commit hooks to prevent introducing new issues.\n`;

fs.writeFileSync(summaryFile, summary);
console.log(`Final summary saved to ${summaryFile}`);

console.log('\n✅ Code quality reports generated successfully!');
console.log(`Reports are located in: ${REPORTS_DIR}`); 