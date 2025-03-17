#!/usr/bin/env node

/**
 * Script to track code quality improvements over time
 * This script analyzes historical reports and generates trend data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPORTS_DIR = path.join(__dirname, '../../reports');
const HISTORY_DIR = path.join(REPORTS_DIR, 'history');
const TRENDS_FILE = path.join(REPORTS_DIR, 'quality-trends.json');
const TRENDS_CHART = path.join(REPORTS_DIR, 'quality-trends.html');

// Ensure directories exist
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

console.log('Tracking code quality improvements over time...');

// Function to run a command and capture output
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
    return '';
  }
}

// Get current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// Store current reports as historical snapshots
console.log('\n📊 Storing current reports as historical data...');

// Projects to track
const projects = ['server', 'client'];

// Metrics to track
const metrics = {
  typeCoverage: {},
  eslintErrors: {},
  eslintWarnings: {},
  typeIssues: {}
};

// Process TypeScript type coverage
console.log('\nProcessing TypeScript type coverage...');
const typeCoverageFile = path.join(REPORTS_DIR, 'type-coverage.json');

if (fs.existsSync(typeCoverageFile)) {
  try {
    const typeCoverage = JSON.parse(fs.readFileSync(typeCoverageFile, 'utf8'));
    
    // Store metrics by project
    typeCoverage.forEach(projectData => {
      metrics.typeCoverage[projectData.project] = projectData.coverage;
      metrics.typeIssues[projectData.project] = projectData.files.reduce(
        (count, file) => count + file.issues.length, 0
      );
    });
    
    // Save a snapshot of the current report
    const snapshotFile = path.join(HISTORY_DIR, `type-coverage-${currentDate}.json`);
    fs.writeFileSync(snapshotFile, JSON.stringify(typeCoverage, null, 2));
    
    console.log('✅ Type coverage data processed and stored');
  } catch (error) {
    console.error('Error processing type coverage data:', error.message);
  }
}

// Process ESLint reports
console.log('\nProcessing ESLint reports...');

projects.forEach(project => {
  const eslintFile = path.join(REPORTS_DIR, `eslint-${project}.json`);
  
  if (fs.existsSync(eslintFile)) {
    try {
      const eslintData = JSON.parse(fs.readFileSync(eslintFile, 'utf8'));
      
      // Calculate metrics
      const errorCount = eslintData.reduce((count, file) => count + file.errorCount, 0);
      const warningCount = eslintData.reduce((count, file) => count + file.warningCount, 0);
      
      metrics.eslintErrors[project] = errorCount;
      metrics.eslintWarnings[project] = warningCount;
      
      // Save a snapshot of the current report
      const snapshotFile = path.join(HISTORY_DIR, `eslint-${project}-${currentDate}.json`);
      fs.writeFileSync(snapshotFile, JSON.stringify(eslintData, null, 2));
      
      console.log(`✅ ESLint data for ${project} processed and stored`);
    } catch (error) {
      console.error(`Error processing ESLint data for ${project}:`, error.message);
    }
  }
});

// Update trends data
console.log('\n📈 Updating code quality trends...');

// Initialize trends object or load existing
let trends = { dates: [], metrics: {} };

if (fs.existsSync(TRENDS_FILE)) {
  try {
    trends = JSON.parse(fs.readFileSync(TRENDS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading trends data:', error.message);
  }
}

// Add current date to trends if it doesn't exist
if (!trends.dates.includes(currentDate)) {
  trends.dates.push(currentDate);
}

// Initialize metrics structure if needed
Object.keys(metrics).forEach(metricType => {
  if (!trends.metrics[metricType]) {
    trends.metrics[metricType] = {};
  }
  
  Object.keys(metrics[metricType]).forEach(project => {
    if (!trends.metrics[metricType][project]) {
      trends.metrics[metricType][project] = {};
    }
    
    trends.metrics[metricType][project][currentDate] = metrics[metricType][project];
  });
});

// Save updated trends
fs.writeFileSync(TRENDS_FILE, JSON.stringify(trends, null, 2));
console.log(`✅ Trends data updated and saved to ${TRENDS_FILE}`);

// Generate HTML visualization
console.log('\n📊 Generating visualization...');

// Create chart using Chart.js
const chartHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Quality Trends</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1, h2 {
      text-align: center;
      color: #333;
    }
    .chart-container {
      position: relative;
      height: 400px;
      margin: 30px 0;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .summary {
      margin: 20px 0;
      padding: 15px;
      background-color: #f0f8ff;
      border-radius: 8px;
      border-left: 5px solid #4B89DC;
    }
    .improvement {
      color: #2ecc71;
    }
    .regression {
      color: #e74c3c;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Code Quality Trends</h1>
    <p class="summary">
      This report shows the trends in code quality metrics over time. 
      It tracks TypeScript type coverage, ESLint errors and warnings, and type issues.
    </p>
    
    <div class="chart-container">
      <h2>TypeScript Type Coverage</h2>
      <canvas id="typeCoverageChart"></canvas>
    </div>
    
    <div class="chart-container">
      <h2>ESLint Errors</h2>
      <canvas id="eslintErrorsChart"></canvas>
    </div>
    
    <div class="chart-container">
      <h2>ESLint Warnings</h2>
      <canvas id="eslintWarningsChart"></canvas>
    </div>
    
    <div class="chart-container">
      <h2>TypeScript Issues</h2>
      <canvas id="typeIssuesChart"></canvas>
    </div>
    
    <script>
      // Load trends data
      const trends = ${JSON.stringify(trends)};
      
      // Helper function to get chart data
      function getChartData(metricType) {
        const datasets = [];
        const projectColors = {
          server: 'rgb(54, 162, 235)',
          client: 'rgb(255, 99, 132)'
        };
        
        // Create a dataset for each project
        Object.keys(trends.metrics[metricType] || {}).forEach(project => {
          const projectData = trends.metrics[metricType][project];
          const data = trends.dates.map(date => projectData[date] || null);
          
          datasets.push({
            label: project,
            data: data,
            borderColor: projectColors[project],
            backgroundColor: projectColors[project].replace('rgb', 'rgba').replace(')', ', 0.2)'),
            fill: false,
            tension: 0.1
          });
        });
        
        return {
          labels: trends.dates,
          datasets: datasets
        };
      }
      
      // Function to calculate improvements
      function calculateImprovements(metricType) {
        const improvements = {};
        
        Object.keys(trends.metrics[metricType] || {}).forEach(project => {
          const projectData = trends.metrics[metricType][project];
          const dates = Object.keys(projectData).sort();
          
          if (dates.length >= 2) {
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            const firstValue = projectData[firstDate];
            const lastValue = projectData[lastDate];
            
            // Calculate improvement (positive for coverage, negative for errors)
            let improvement;
            if (metricType === 'typeCoverage') {
              improvement = lastValue - firstValue;
            } else {
              improvement = firstValue - lastValue;
            }
            
            improvements[project] = improvement;
          }
        });
        
        return improvements;
      }
      
      // Create charts
      window.onload = function() {
        // Type Coverage Chart
        new Chart(document.getElementById('typeCoverageChart'), {
          type: 'line',
          data: getChartData('typeCoverage'),
          options: {
            scales: {
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: 'Coverage %'
                }
              }
            }
          }
        });
        
        // ESLint Errors Chart
        new Chart(document.getElementById('eslintErrorsChart'), {
          type: 'line',
          data: getChartData('eslintErrors'),
          options: {
            scales: {
              y: {
                min: 0,
                title: {
                  display: true,
                  text: 'Count'
                }
              }
            }
          }
        });
        
        // ESLint Warnings Chart
        new Chart(document.getElementById('eslintWarningsChart'), {
          type: 'line',
          data: getChartData('eslintWarnings'),
          options: {
            scales: {
              y: {
                min: 0,
                title: {
                  display: true,
                  text: 'Count'
                }
              }
            }
          }
        });
        
        // Type Issues Chart
        new Chart(document.getElementById('typeIssuesChart'), {
          type: 'line',
          data: getChartData('typeIssues'),
          options: {
            scales: {
              y: {
                min: 0,
                title: {
                  display: true,
                  text: 'Count'
                }
              }
            }
          }
        });
      };
    </script>
  </div>
</body>
</html>
`;

fs.writeFileSync(TRENDS_CHART, chartHtml);
console.log(`✅ Visualization saved to ${TRENDS_CHART}`);

console.log('\n✅ Code quality tracking complete!');
console.log(`You can view the visualization by opening ${TRENDS_CHART} in a browser.`); 