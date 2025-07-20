#!/bin/bash

# Set development environment variables
export NODE_ENV=development
export NEXT_PUBLIC_API_URL=http://localhost:3000

# Start both the Next.js frontend and Node.js API server in development mode
echo "Starting Music Stream Next.js application in development mode..."
npm run dev:all