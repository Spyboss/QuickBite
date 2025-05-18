#!/usr/bin/env node

/**
 * Custom build script for Cloudflare Pages
 * This script ensures a clean build environment and handles Rollup dependencies properly
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Execute a command and log output
function execute(command) {
  log(`Executing: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    log(`Error executing command: ${error.message}`);
    throw error;
  }
}

// Main build function
async function build() {
  try {
    log('Starting Cloudflare Pages build process');

    // Check Node.js version
    const nodeVersion = process.version;
    log(`Using Node.js ${nodeVersion}`);

    // Check if we need to update package.json to match the current Node.js version
    const requiredNodeVersion = '>=20.11.1';
    const currentNodeMajorVersion = nodeVersion.match(/v(\d+)\./)[1];

    // If we're running on Node.js 18 (Cloudflare's default), temporarily modify package.json
    if (currentNodeMajorVersion < 20) {
      log(`Running on Node.js ${nodeVersion}, which is below the required version ${requiredNodeVersion}`);
      log('Temporarily adjusting package.json to work with the current Node.js version');

      try {
        const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Save the original engines requirement for reference
        const originalNodeRequirement = packageJson.engines?.node;
        log(`Original Node.js requirement: ${originalNodeRequirement}`);

        // Update engines to match the current Node.js version
        packageJson.engines = {
          ...packageJson.engines,
          node: `>=${currentNodeMajorVersion}.0.0`
        };

        // Write the updated package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        log(`Updated package.json to require Node.js >=${currentNodeMajorVersion}.0.0`);
      } catch (error) {
        log(`Warning: Failed to update package.json: ${error.message}`);
      }
    }

    // Install dependencies with specific flags
    log('Installing dependencies');
    execute('npm install --no-audit --prefer-offline');

    // On Cloudflare's Linux environment, we need to ensure Rollup dependencies are installed
    // Skip this check on Windows as it will fail
    if (process.platform !== 'win32') {
      log('Checking Rollup dependencies (Linux only)');
      const rollupDeps = [
        '@rollup/rollup-linux-x64-gnu',
        '@rollup/rollup-linux-x64-musl'
      ];

      // Force install the Rollup dependencies for the current platform
      log('Installing Rollup dependencies for Linux');
      try {
        execute('npm install @rollup/rollup-linux-x64-gnu@4.41.0 @rollup/rollup-linux-x64-musl@4.41.0 --no-save');
        log('Successfully installed Rollup dependencies');
      } catch (error) {
        log(`Warning: Failed to install Rollup dependencies: ${error.message}`);
        log('Continuing with build anyway...');
      }
    } else {
      log('Skipping Rollup dependency check on Windows');
    }

    // Run the build
    log('Running build command');
    execute('npm run build');

    log('Build completed successfully');
  } catch (error) {
    log(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the build
build();
