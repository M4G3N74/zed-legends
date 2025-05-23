#!/bin/bash

# Make the script executable if it's not already
chmod +x "$0"

# Start the server
echo "Starting Music Stream server..."
node server.js
