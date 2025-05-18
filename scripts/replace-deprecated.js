#!/usr/bin/env node

/**
 * Script to replace deprecated dependencies with modern alternatives
 * 
 * This script:
 * 1. Identifies files using deprecated packages
 * 2. Suggests replacements for common patterns
 * 3. Optionally applies the replacements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Execute a command and return the output
function execute(command, options = {}) {
  log(`Executing: ${command}`);
  try {
    return execSync(command, { encoding: 'utf8', ...options });
  } catch (error) {
    if (options.ignoreError) {
      return error.stdout;
    }
    log(`Error executing command: ${error.message}`);
    throw error;
  }
}

// Find files containing a specific import
function findFilesWithImport(importPattern, directory = '.') {
  try {
    const command = `grep -r "import.*${importPattern}" --include="*.{js,jsx,ts,tsx}" ${directory}`;
    const result = execute(command, { ignoreError: true });
    return result.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    log(`Error finding files with import ${importPattern}: ${error.message}`);
    return [];
  }
}

// Replace lodash.get with optional chaining
function replaceLodashGet(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statement
    let newContent = content.replace(
      /import\s+(\w+)\s+from\s+['"]lodash\.get['"]/g,
      '// Replaced lodash.get with optional chaining'
    );
    
    // Replace usage patterns
    newContent = newContent.replace(
      /(\w+)\(([^,]+),\s*['"]([^'"]+)['"]\)/g,
      (match, funcName, obj, path) => {
        // Convert path string to optional chaining
        const props = path.split('.');
        return `${obj}${props.map(p => `?.${p}`).join('')}`;
      }
    );
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      log(`Updated ${filePath} to replace lodash.get with optional chaining`);
      return true;
    }
    
    return false;
  } catch (error) {
    log(`Error replacing lodash.get in ${filePath}: ${error.message}`);
    return false;
  }
}

// Replace lodash.isequal with util.isDeepStrictEqual
function replaceLodashIsEqual(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statement
    let newContent = content.replace(
      /import\s+(\w+)\s+from\s+['"]lodash\.isequal['"]/g,
      'import { isDeepStrictEqual } from \'node:util\''
    );
    
    // Replace usage patterns
    newContent = newContent.replace(
      /(\w+)\(([^,]+),\s*([^)]+)\)/g,
      'isDeepStrictEqual($2, $3)'
    );
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      log(`Updated ${filePath} to replace lodash.isequal with util.isDeepStrictEqual`);
      return true;
    }
    
    return false;
  } catch (error) {
    log(`Error replacing lodash.isequal in ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('Starting deprecated dependency replacement');
  
  // Find files using lodash.get
  log('Searching for files using lodash.get...');
  const lodashGetFiles = findFilesWithImport('lodash.get');
  
  if (lodashGetFiles.length > 0) {
    log(`Found ${lodashGetFiles.length} files using lodash.get`);
    for (const file of lodashGetFiles) {
      const filePath = file.split(':')[0];
      replaceLodashGet(filePath);
    }
  } else {
    log('No files found using lodash.get');
  }
  
  // Find files using lodash.isequal
  log('Searching for files using lodash.isequal...');
  const lodashIsEqualFiles = findFilesWithImport('lodash.isequal');
  
  if (lodashIsEqualFiles.length > 0) {
    log(`Found ${lodashIsEqualFiles.length} files using lodash.isequal`);
    for (const file of lodashIsEqualFiles) {
      const filePath = file.split(':')[0];
      replaceLodashIsEqual(filePath);
    }
  } else {
    log('No files found using lodash.isequal');
  }
  
  log('Deprecated dependency replacement completed');
}

// Run the main function
main().catch(error => {
  log(`Error: ${error.message}`);
  process.exit(1);
});
