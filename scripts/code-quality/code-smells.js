#!/usr/bin/env node

/**
 * Script to detect code smells and potential type safety issues
 * This goes beyond ESLint and TypeScript to find more subtle issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPORTS_DIR = path.join(__dirname, '../../reports');
const SMELLS_REPORT = path.join(REPORTS_DIR, 'code-smells.md');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('Analyzing codebase for code smells and type safety issues...');

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

// Type safety patterns to search for
const typePatterns = [
  {
    name: 'Type Assertion Without Validation',
    pattern: 'as [A-Z]\\w+',
    description: 'Type assertions (using "as") without runtime validation can lead to runtime errors if the actual type does not match.',
    suggestion: 'Add runtime type checking before the assertion or use a type guard function.'
  },
  {
    name: 'Non-Null Assertion',
    pattern: '\\w+!\\.',
    description: 'Non-null assertions (using "!") bypass TypeScript\'s null checks and can cause runtime errors.',
    suggestion: 'Use optional chaining (?.) or nullish coalescing (??) operators instead.'
  },
  {
    name: 'Unsafe Type Casting',
    pattern: '<[A-Z]\\w+>\\(',
    description: 'Type casting using angle brackets can be unsafe without proper validation.',
    suggestion: 'Use "as" syntax with validation or implement proper type guards.'
  },
  {
    name: 'Explicit Any Types',
    pattern: ': any[\\,\\)]',
    description: 'Using "any" type bypasses TypeScript\'s type checking.',
    suggestion: 'Replace with more specific types, or use "unknown" if the type is truly not known.'
  },
  {
    name: 'Object Literal Type Widening',
    pattern: '= {}',
    description: 'Empty object literals with no type annotation are typed as "{}" which can lead to type issues.',
    suggestion: 'Add a type annotation or initialize with expected properties.'
  },
  {
    name: 'Index Signature Access Without Check',
    pattern: '\\w+\\[[\'\"][\\w-]+[\'\"]\\]',
    description: 'Accessing object properties via indexing without checking existence can lead to undefined values.',
    suggestion: 'Use optional chaining or check if the property exists before accessing it.'
  },
  {
    name: 'Nested Nullable Access',
    pattern: '\\w+\\.\\w+\\.\\w+\\.\\w+',
    description: 'Deeply nested property access without null checks is prone to errors.',
    suggestion: 'Use optional chaining (obj?.prop?.subprop) to safely access nested properties.'
  },
  {
    name: 'Unnecessary Type Parameters',
    pattern: '<\\w+>\\(\\)',
    description: 'Unnecessary type parameters can often be inferred by TypeScript.',
    suggestion: 'Let TypeScript infer the type if possible, or use a more specific type.'
  },
  {
    name: 'Implicit Boolean Conversion',
    pattern: 'if \\(\\w+\\)',
    description: 'Implicit boolean conversions can be error-prone with falsy values.',
    suggestion: 'Use explicit boolean checks (=== true, !== null, etc.) for clarity.'
  },
  {
    name: 'Generic Array Creation',
    pattern: 'new Array<',
    description: 'Using Array constructor with a generic type can be verbose.',
    suggestion: 'Use array literal syntax with a type annotation: const arr: Type[] = [];'
  },
  {
    name: 'String Enum Without Values',
    pattern: 'enum [A-Z]\\w+ {[^=]+}',
    description: 'String enums without explicit values rely on positional ordering.',
    suggestion: 'Explicitly assign string values to enum members for clarity and safety.'
  },
  {
    name: 'Type Guard Without Return Type',
    pattern: 'function is[A-Z]\\w+\\([^\\)]+\\)[^:]',
    description: 'Type guard functions without explicit return type annotations.',
    suggestion: 'Add explicit "return type is Type" annotation to type guard functions.'
  },
  {
    name: 'Promise Without Typing',
    pattern: 'Promise<any>',
    description: 'Using Promise<any> loses type information about the resolved value.',
    suggestion: 'Specify the expected type of the Promise\'s resolved value.'
  },
  {
    name: 'String Concatenation',
    pattern: '\\w+ \\+ [\'"]',
    description: 'String concatenation with + can lead to unexpected results with type coercion.',
    suggestion: 'Use template literals for string interpolation.'
  },
  {
    name: 'Equality Without Type Check',
    pattern: '== ',
    description: 'Using == instead of === can lead to unexpected equality results.',
    suggestion: 'Use === for strict equality checks.'
  }
];

// Function to scan a file for patterns
function scanFile(filePath, patterns) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];
  
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.pattern, 'g');
    
    lines.forEach((line, lineNumber) => {
      if (regex.test(line)) {
        results.push({
          pattern: pattern.name,
          description: pattern.description,
          suggestion: pattern.suggestion,
          file: filePath,
          line: lineNumber + 1,
          code: line.trim()
        });
      }
      // Reset the regex for next line
      regex.lastIndex = 0;
    });
  });
  
  return results;
}

// Projects to scan
const projects = ['server', 'client'];
let allFindings = [];

// Scan TypeScript files
console.log('\nScanning TypeScript files for code smells...');

projects.forEach(project => {
  const projectDir = path.join(__dirname, `../../${project}`);
  
  if (!fs.existsSync(projectDir)) {
    console.log(`⚠️ Project directory not found: ${projectDir}`);
    return;
  }
  
  // Find all TypeScript files
  const findCommand = `find ${projectDir} -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | grep -v "dist"`;
  const files = runCommand(findCommand, { silent: true }).trim().split('\n').filter(Boolean);
  
  console.log(`Found ${files.length} TypeScript files in ${project}...`);
  
  // Scan each file
  files.forEach(file => {
    const findings = scanFile(file, typePatterns);
    if (findings.length > 0) {
      allFindings = allFindings.concat(findings);
    }
  });
});

// Additional code smell detection: Find large classes/components
console.log('\nChecking for large files (potential code smells)...');

projects.forEach(project => {
  const projectDir = path.join(__dirname, `../../${project}`);
  
  if (!fs.existsSync(projectDir)) {
    return;
  }
  
  // Find all TypeScript files with line counts
  const findCommand = `find ${projectDir} -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | grep -v "dist" | xargs wc -l | sort -nr`;
  const output = runCommand(findCommand, { silent: true });
  
  const largeFiles = output
    .trim()
    .split('\n')
    .map(line => {
      const match = line.match(/^\s*(\d+)\s+(.+)$/);
      return match ? { lines: parseInt(match[1]), file: match[2] } : null;
    })
    .filter(item => item && item.lines > 200) // Consider files with > 200 lines as "large"
    .slice(0, 10); // Top 10 largest files
  
  if (largeFiles.length > 0) {
    largeFiles.forEach(item => {
      allFindings.push({
        pattern: 'Large File',
        description: 'Files with too many lines may violate the Single Responsibility Principle.',
        suggestion: 'Consider breaking down this file into smaller, more focused modules.',
        file: item.file,
        line: 1,
        code: `This file has ${item.lines} lines of code.`
      });
    });
  }
});

// Generate report
console.log(`\nGenerating code smells report with ${allFindings.length} findings...`);

// Group findings by pattern
const groupedFindings = {};
allFindings.forEach(finding => {
  if (!groupedFindings[finding.pattern]) {
    groupedFindings[finding.pattern] = [];
  }
  groupedFindings[finding.pattern].push(finding);
});

// Create markdown report
let report = `# Code Smells and Type Safety Issues Report\n\n`;
report += `Report generated on: ${new Date().toLocaleString()}\n\n`;
report += `Total issues found: ${allFindings.length}\n\n`;

// Add summary table
report += `## Summary of Issues\n\n`;
report += `| Issue Type | Count | Description |\n`;
report += `|------------|-------|-------------|\n`;

Object.entries(groupedFindings).forEach(([pattern, findings]) => {
  report += `| ${pattern} | ${findings.length} | ${findings[0].description} |\n`;
});

// Add detailed findings
report += `\n## Detailed Findings\n\n`;

Object.entries(groupedFindings).forEach(([pattern, findings]) => {
  report += `### ${pattern}\n\n`;
  report += `${findings[0].description}\n\n`;
  report += `**Suggestion:** ${findings[0].suggestion}\n\n`;
  
  if (findings.length > 20) {
    report += `*Showing 20 of ${findings.length} instances*\n\n`;
    findings = findings.slice(0, 20);
  }
  
  report += `| File | Line | Code |\n`;
  report += `|------|------|------|\n`;
  
  findings.forEach(finding => {
    const relPath = finding.file.replace(path.join(__dirname, '../../'), '');
    report += `| ${relPath} | ${finding.line} | \`${finding.code.replace(/\|/g, '\\|')}\` |\n`;
  });
  
  report += `\n`;
});

// Add recommendations
report += `## Recommendations\n\n`;
report += `1. Review type assertions and non-null assertions to ensure proper runtime validation.\n`;
report += `2. Replace loose equality (==) with strict equality (===) throughout the codebase.\n`;
report += `3. Use optional chaining and nullish coalescing for safer property access.\n`;
report += `4. Consider breaking down large files into smaller, more focused modules.\n`;
report += `5. Replace string concatenation with template literals for better readability.\n`;
report += `6. Add explicit type annotations to functions that return complex types.\n`;
report += `7. Implement proper type guards for safer type narrowing.\n`;
report += `8. Review enums to ensure they have explicit values rather than relying on positional ordering.\n`;

// Save report
fs.writeFileSync(SMELLS_REPORT, report);
console.log(`✅ Code smells report saved to ${SMELLS_REPORT}`);

// Exit with success
console.log('\n✅ Code smell analysis complete!');

// Exit with error code if issues found, to potentially fail CI builds
if (allFindings.length > 0) {
  console.log(`⚠️ Found ${allFindings.length} potential code quality issues.`);
  process.exit(0); // Using 0 to not break builds, change to 1 if you want to fail CI on issues
} else {
  console.log('🎉 No code smells or type safety issues detected!');
} 