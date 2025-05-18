#!/bin/bash

# Custom build script for Cloudflare Pages
echo "Starting QuickBite build process..."

# Navigate to the frontend directory
cd quickbite-app

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# Return to the root directory
cd ..

echo "Build completed successfully!"
