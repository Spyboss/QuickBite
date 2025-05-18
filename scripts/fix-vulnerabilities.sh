#!/bin/bash

# Script to fix security vulnerabilities in the QuickBite application

echo "Starting vulnerability fix script..."

# Function to run npm audit and fix non-breaking vulnerabilities
fix_vulnerabilities() {
  local dir=$1
  echo "Checking vulnerabilities in $dir..."
  
  # Change to the directory
  cd $dir || exit 1
  
  # Run npm audit to get a report
  echo "Running npm audit in $dir..."
  npm audit --json > npm-audit-report.json
  
  # Fix non-breaking vulnerabilities
  echo "Fixing non-breaking vulnerabilities in $dir..."
  npm audit fix
  
  # Check if there are still vulnerabilities
  echo "Checking remaining vulnerabilities in $dir..."
  npm audit --json > npm-audit-remaining.json
  
  # Return to the original directory
  cd - > /dev/null
}

# Fix vulnerabilities in the root directory
echo "Fixing vulnerabilities in the root directory..."
fix_vulnerabilities .

# Fix vulnerabilities in the frontend directory
echo "Fixing vulnerabilities in the frontend directory..."
fix_vulnerabilities quickbite-app

# Fix vulnerabilities in the backend directory
echo "Fixing vulnerabilities in the backend directory..."
fix_vulnerabilities quickbite-backend

echo "Vulnerability fix script completed."
echo "Check the npm-audit-remaining.json files in each directory for any remaining vulnerabilities."
echo "For critical vulnerabilities, consider manually updating the affected packages."
