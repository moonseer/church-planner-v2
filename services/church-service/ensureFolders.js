const fs = require('fs');
const path = require('path');

// List of directories to ensure exist
const directories = [
  'logs'
];

// Ensure each directory exists
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
});

console.log('All required directories have been ensured.'); 