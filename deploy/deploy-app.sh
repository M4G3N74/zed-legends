#!/bin/bash
# Deployment script for Zambian Legends Music Streaming App
# Run this script as a regular user (not root) on your VPS

# Exit on error
set -e

# Configuration
APP_DIR="/opt/zambian-legends"
REPO_URL="https://github.com/yourusername/zambian-legends.git"  # Replace with your actual repository URL
BRANCH="main"  # Replace with your branch name if different

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "Error: App directory $APP_DIR does not exist."
    echo "Please run the setup-server.sh script first."
    exit 1
fi

# Navigate to app directory
cd $APP_DIR

# Check if the repository is already cloned
if [ -d ".git" ]; then
    echo "Repository already exists. Pulling latest changes..."
    git pull origin $BRANCH
else
    echo "Cloning repository..."
    # Remove any existing files (if directory is not empty)
    rm -rf $APP_DIR/*
    
    # Clone the repository
    git clone -b $BRANCH $REPO_URL .
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOL'
# Environment variables
PORT=3000
MUSIC_DIR=/opt/zambian-legends/music
EOL
fi

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 delete zambian-legends 2>/dev/null || true
pm2 start server.js --name zambian-legends

# Save PM2 configuration to restart on server reboot
echo "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
echo "Setting up PM2 to start on boot..."
pm2 startup | tail -n 1 > startup_command.txt
echo "Run the following command as root to enable PM2 startup on boot:"
cat startup_command.txt

echo "Deployment complete!"
echo ""
echo "Your application should now be running at http://your-server-ip"
echo ""
echo "Next steps:"
echo "1. Upload your music files to /opt/zambian-legends/music"
echo "2. Access your application through your browser"
echo "3. If you have a domain, update the Nginx configuration in /etc/nginx/sites-available/zambian-legends"
echo ""
echo "To check the application logs, run: pm2 logs zambian-legends"
