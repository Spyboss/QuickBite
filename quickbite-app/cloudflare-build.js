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

    // Clean up node_modules if it exists
    if (fs.existsSync('node_modules')) {
      log('Cleaning up existing node_modules');
      // Use rimraf or OS-specific command
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        execute('if exist node_modules rmdir /s /q node_modules');
      } else {
        execute('rm -rf node_modules');
      }
    }

    // Clean up package-lock.json if it exists
    if (fs.existsSync('package-lock.json')) {
      log('Removing package-lock.json');
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        execute('if exist package-lock.json del package-lock.json');
      } else {
        execute('rm -f package-lock.json');
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

      for (const dep of rollupDeps) {
        try {
          require.resolve(dep);
          log(`✅ ${dep} is installed`);
        } catch (error) {
          log(`⚠️ ${dep} is not installed, installing it now`);
          execute(`npm install ${dep}@4.9.6 --no-save`);
        }
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
