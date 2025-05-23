#!/bin/bash

# Build the Next.js application first
echo "Building Next.js application..."
npm run build

# Start both the Next.js frontend and Node.js API server in production mode
echo "Starting Music Stream Next.js application in production mode..."
npm run start:all
