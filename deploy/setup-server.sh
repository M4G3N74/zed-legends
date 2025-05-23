#!/bin/bash
# Server setup script for Zambian Legends Music Streaming App
# Run this script as root on your VPS

# Exit on error
set -e

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y curl wget git nginx nodejs npm vorbis-tools

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null || [[ $(node -v) != v18* ]]; then
    echo "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 for process management
echo "Installing PM2..."
npm install -g pm2

# Create app directory
echo "Creating app directory..."
mkdir -p /opt/zambian-legends
chown -R $SUDO_USER:$SUDO_USER /opt/zambian-legends

# Create music directory
echo "Creating music directory..."
mkdir -p /opt/zambian-legends/music
chown -R $SUDO_USER:$SUDO_USER /opt/zambian-legends/music

# Set up Nginx
echo "Setting up Nginx..."
cat > /etc/nginx/sites-available/zambian-legends << 'EOL'
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or server IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # For large file uploads (music files)
    client_max_body_size 100M;
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/zambian-legends /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

# Enable Nginx to start on boot
systemctl enable nginx

echo "Server setup complete!"
echo "Next steps:"
echo "1. Clone your repository to /opt/zambian-legends"
echo "2. Install dependencies with npm install"
echo "3. Build the app with npm run build"
echo "4. Start the app with PM2"
echo "5. Upload your music files to /opt/zambian-legends/music"
