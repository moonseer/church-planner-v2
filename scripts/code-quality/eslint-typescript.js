#!/usr/bin/env node

/**
 * Script to update ESLint configurations with TypeScript-specific rules
 */

const fs = require('fs');
const path = require('path');

// TypeScript-specific ESLint rules to add
const typescriptRules = {
  // Error prevention rules
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
  '@typescript-eslint/explicit-module-boundary-types': 'warn',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/ban-types': 'warn',
  '@typescript-eslint/no-namespace': 'warn',
  '@typescript-eslint/no-var-requires': 'warn',
  '@typescript-eslint/no-array-constructor': 'warn',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-floating-promises': 'warn',
  '@typescript-eslint/no-this-alias': 'warn',
  '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
  
  // Type safety enhancement rules
  '@typescript-eslint/prefer-nullish-coalescing': 'warn',
  '@typescript-eslint/prefer-optional-chain': 'warn',
  '@typescript-eslint/prefer-as-const': 'warn',
  '@typescript-eslint/prefer-for-of': 'warn',
  '@typescript-eslint/prefer-enum-initializers': 'warn',
  '@typescript-eslint/prefer-literal-enum-member': 'warn',
  '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
  '@typescript-eslint/prefer-includes': 'warn',
  '@typescript-eslint/prefer-readonly': 'warn',
  '@typescript-eslint/prefer-ts-expect-error': 'warn',
  
  // Consistency and best practices
  '@typescript-eslint/unified-signatures': 'warn',
  '@typescript-eslint/consistent-type-assertions': 'warn',
  '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
  '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
  '@typescript-eslint/consistent-indexed-object-style': ['warn', 'record'],
  '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'explicit' }],
  
  // Naming conventions
  '@typescript-eslint/naming-convention': [
    'warn',
    // Interface and type naming
    {
      selector: 'interface',
      format: ['PascalCase'],
      prefix: ['I']
    },
    // Type naming
    {
      selector: 'typeAlias',
      format: ['PascalCase']
    },
    // Enum naming
    {
      selector: 'enum',
      format: ['PascalCase']
    },
    // Enum member naming
    {
      selector: 'enumMember',
      format: ['UPPER_CASE']
    },
    // Class members
    {
      selector: 'memberLike',
      modifiers: ['private'],
      format: ['camelCase'],
      leadingUnderscore: 'require'
    },
    // Generic parameters
    {
      selector: 'typeParameter',
      format: ['PascalCase'],
      prefix: ['T']
    }
  ],
  
  // Strict type checking
  '@typescript-eslint/no-unsafe-assignment': 'warn',
  '@typescript-eslint/no-unsafe-member-access': 'warn',
  '@typescript-eslint/no-unsafe-call': 'warn',
  '@typescript-eslint/no-unsafe-return': 'warn',
  '@typescript-eslint/restrict-plus-operands': 'warn',
  '@typescript-eslint/restrict-template-expressions': 'warn',
  '@typescript-eslint/await-thenable': 'warn',
  '@typescript-eslint/require-await': 'warn',
  '@typescript-eslint/no-misused-promises': 'warn',
  '@typescript-eslint/no-for-in-array': 'error',
  
  // Advanced checks and patterns
  '@typescript-eslint/method-signature-style': ['warn', 'property'],
  '@typescript-eslint/member-ordering': 'warn',
  '@typescript-eslint/array-type': ['warn', { default: 'array' }],
  '@typescript-eslint/ban-tslint-comment': 'warn',
  '@typescript-eslint/class-literal-property-style': ['warn', 'fields'],
  '@typescript-eslint/consistent-generic-constructors': ['warn', 'type-annotation'],
  '@typescript-eslint/no-confusing-non-null-assertion': 'warn'
};

// ESLint config files to update
const configFiles = [
  { 
    path: path.join(__dirname, '../../server/.eslintrc.js'),
    projectType: 'server'
  },
  { 
    path: path.join(__dirname, '../../client/eslint.config.js'),
    projectType: 'client'
  }
];

console.log('Updating ESLint configurations with enhanced TypeScript-specific rules...');

configFiles.forEach(configFile => {
  const filePath = configFile.path;
  if (!fs.existsSync(filePath)) {
    console.log(`Config file not found: ${filePath}`);
    return;
  }

  console.log(`Updating ${filePath}...`);
  
  try {
    const originalConfig = require(filePath);
    
    // Create a backup of the original file
    fs.copyFileSync(filePath, `${filePath}.bak`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (configFile.projectType === 'server') {
      // For .eslintrc.js format
      if (!content.includes('@typescript-eslint/no-explicit-any')) {
        // Find the rules section
        const rulesMatch = content.match(/rules\s*:\s*{/);
        if (rulesMatch) {
          const rulesStart = content.indexOf(rulesMatch[0]) + rulesMatch[0].length;
          
          // Create the new rules string
          const newRules = Object.entries(typescriptRules)
            .map(([rule, config]) => `    "${rule}": ${JSON.stringify(config)},`)
            .join('\n');
          
          // Insert the new rules
          content = content.slice(0, rulesStart) + '\n' + newRules + content.slice(rulesStart);
        }
      }
    } else if (configFile.projectType === 'client') {
      // For eslint.config.js format
      if (!content.includes('@typescript-eslint/no-explicit-any')) {
        // Find the rules section
        const rulesMatch = content.match(/rules\s*:\s*{/);
        if (rulesMatch) {
          const rulesStart = content.indexOf(rulesMatch[0]) + rulesMatch[0].length;
          
          // Create the new rules string
          const newRules = Object.entries(typescriptRules)
            .map(([rule, config]) => `    '${rule}': ${JSON.stringify(config)},`)
            .join('\n');
          
          // Insert the new rules
          content = content.slice(0, rulesStart) + '\n' + newRules + content.slice(rulesStart);
        }
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${filePath} with enhanced TypeScript rules`);
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

// Add ESLint plugin parser options
console.log('\nUpdating ESLint parser options for advanced type checking...');

configFiles.forEach(configFile => {
  const filePath = configFile.path;
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add or update parserOptions.project
    if (configFile.projectType === 'server') {
      if (!content.includes('parserOptions.project')) {
        // Find the parserOptions section or create one
        const parserOptionsMatch = content.match(/parserOptions\s*:\s*{/);
        if (parserOptionsMatch) {
          const parserOptionsStart = content.indexOf(parserOptionsMatch[0]) + parserOptionsMatch[0].length;
          
          // Add project tsconfig
          const newParserOptions = `    project: './tsconfig.json',\n`;
          
          // Insert the new parser options
          content = content.slice(0, parserOptionsStart) + '\n' + newParserOptions + content.slice(parserOptionsStart);
        } else {
          // No parserOptions found, add it before rules
          const rulesMatch = content.match(/rules\s*:\s*{/);
          if (rulesMatch) {
            const rulesIndex = content.indexOf(rulesMatch[0]);
            
            // Create parser options section
            const parserOptions = `  parserOptions: {
    project: './tsconfig.json',
  },
  
`;
            
            // Insert the parser options
            content = content.slice(0, rulesIndex) + parserOptions + content.slice(rulesIndex);
          }
        }
      }
    } else if (configFile.projectType === 'client') {
      // Similar for client but with appropriate format
      if (!content.includes('parserOptions.project')) {
        const parserOptionsMatch = content.match(/parserOptions\s*:\s*{/);
        if (parserOptionsMatch) {
          const parserOptionsStart = content.indexOf(parserOptionsMatch[0]) + parserOptionsMatch[0].length;
          
          // Add project tsconfig
          const newParserOptions = `    project: './tsconfig.app.json',\n`;
          
          // Insert the new parser options
          content = content.slice(0, parserOptionsStart) + '\n' + newParserOptions + content.slice(parserOptionsStart);
        }
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated parser options in ${filePath}`);
    
  } catch (error) {
    console.error(`Error updating parser options in ${filePath}:`, error.message);
  }
});

console.log('\nUpdating package.json scripts...');

// Update package.json in root, client, and server to add more detailed lint scripts
['', 'client', 'server'].forEach(dir => {
  const packagePath = path.join(__dirname, '../../', dir, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      // Add or update lint scripts
      packageJson.scripts['lint:ts'] = 'eslint --ext .ts,.tsx .';
      packageJson.scripts['lint:ts:fix'] = 'eslint --ext .ts,.tsx . --fix';
      packageJson.scripts['lint:ts:strict'] = 'eslint --ext .ts,.tsx . --max-warnings=0';
      packageJson.scripts['type:check'] = 'tsc --noEmit';
      packageJson.scripts['type:coverage'] = 'npx type-coverage --detail';
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log(`✅ Updated scripts in ${packagePath}`);
    } catch (error) {
      console.error(`Error updating ${packagePath}:`, error.message);
    }
  }
});

console.log('\n✅ Done! Enhanced TypeScript ESLint rules have been added.');
console.log('Run any of the following commands to check for TypeScript issues:');
console.log('  npm run lint:ts            - Check for TypeScript linting issues');
console.log('  npm run lint:ts:fix        - Automatically fix fixable issues');
console.log('  npm run lint:ts:strict     - Fail on warnings and errors');
console.log('  npm run type:check         - Run TypeScript compiler checks');
console.log('  npm run type:coverage      - Check type coverage percentage'); 