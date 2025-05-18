#!/usr/bin/env node

/**
 * Script to fix security vulnerabilities in the QuickBite application
 * 
 * This script:
 * 1. Runs npm audit to identify vulnerabilities
 * 2. Attempts to fix non-breaking vulnerabilities with npm audit fix
 * 3. Provides guidance for manually fixing remaining vulnerabilities
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Main function
async function main() {
  log('Starting vulnerability fix script');
  
  // Check if we're in the root directory
  if (!fs.existsSync('package.json')) {
    log('Error: This script must be run from the project root directory');
    process.exit(1);
  }
  
  // Run npm audit in the root directory
  log('Running npm audit in the root directory');
  const rootAudit = execute('npm audit --json', { ignoreError: true });
  fs.writeFileSync('npm-audit-root.json', rootAudit);
  log('Saved audit results to npm-audit-root.json');
  
  // Run npm audit in the frontend directory
  log('Running npm audit in the frontend directory');
  const frontendAudit = execute('cd quickbite-app && npm audit --json', { ignoreError: true });
  fs.writeFileSync('npm-audit-frontend.json', frontendAudit);
  log('Saved audit results to npm-audit-frontend.json');
  
  // Run npm audit in the backend directory
  log('Running npm audit in the backend directory');
  const backendAudit = execute('cd quickbite-backend && npm audit --json', { ignoreError: true });
  fs.writeFileSync('npm-audit-backend.json', backendAudit);
  log('Saved audit results to npm-audit-backend.json');
  
  // Attempt to fix vulnerabilities in the root directory
  log('Attempting to fix vulnerabilities in the root directory');
  execute('npm audit fix', { ignoreError: true });
  
  // Attempt to fix vulnerabilities in the frontend directory
  log('Attempting to fix vulnerabilities in the frontend directory');
  execute('cd quickbite-app && npm audit fix', { ignoreError: true });
  
  // Attempt to fix vulnerabilities in the backend directory
  log('Attempting to fix vulnerabilities in the backend directory');
  execute('cd quickbite-backend && npm audit fix', { ignoreError: true });
  
  // Run npm audit again to check remaining vulnerabilities
  log('Checking remaining vulnerabilities');
  const remainingRootAudit = execute('npm audit --json', { ignoreError: true });
  const remainingFrontendAudit = execute('cd quickbite-app && npm audit --json', { ignoreError: true });
  const remainingBackendAudit = execute('cd quickbite-backend && npm audit --json', { ignoreError: true });
  
  // Save the remaining vulnerabilities
  fs.writeFileSync('npm-audit-root-remaining.json', remainingRootAudit);
  fs.writeFileSync('npm-audit-frontend-remaining.json', remainingFrontendAudit);
  fs.writeFileSync('npm-audit-backend-remaining.json', remainingBackendAudit);
  
  log('Vulnerability fix script completed');
  log('Check the npm-audit-*-remaining.json files for any remaining vulnerabilities');
  log('For critical vulnerabilities, consider manually updating the affected packages');
}

// Run the main function
main().catch(error => {
  log(`Error: ${error.message}`);
  process.exit(1);
});
