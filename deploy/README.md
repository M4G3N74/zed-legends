# Deploying Zambian Legends Music Streaming App to a VPS

This guide will help you deploy the Zambian Legends Music Streaming App to your VPS (Virtual Private Server).

## Prerequisites

1. A VPS with:
   - Ubuntu 20.04 or newer (other Linux distributions may work but instructions may vary)
   - At least 1GB RAM
   - 20GB+ storage (depending on your music library size)
   - Root access

2. A domain name (optional but recommended)
3. Basic knowledge of Linux commands

## Deployment Steps

### 1. Connect to Your VPS

Connect to your VPS using SSH:

```bash
ssh username@your-server-ip
```

Replace `username` with your VPS username and `your-server-ip` with your VPS IP address.

### 2. Set Up the Server

1. Upload the `setup-server.sh` script to your VPS:

```bash
scp setup-server.sh username@your-server-ip:~/
```

2. Make the script executable and run it as root:

```bash
chmod +x setup-server.sh
sudo ./setup-server.sh
```

This script will:
- Update your system
- Install required packages (Node.js, Nginx, etc.)
- Set up Nginx as a reverse proxy
- Create necessary directories

### 3. Deploy the Application

1. Upload the `deploy-app.sh` script to your VPS:

```bash
scp deploy-app.sh username@your-server-ip:~/
```

2. Make the script executable and run it:

```bash
chmod +x deploy-app.sh
./deploy-app.sh
```

This script will:
- Clone the repository to your VPS
- Install dependencies
- Create a .env file
- Start the application using PM2

### 4. Upload Your Music Files

You have two options to upload your music files:

#### Option 1: Using the upload-music.sh script (from your local machine)

1. Edit the `upload-music.sh` script to set your VPS details:
   - Set `SERVER_USER` to your VPS username
   - Set `SERVER_IP` to your VPS IP address
   - Set `LOCAL_MUSIC_DIR` to the path of your local music directory

2. Make the script executable and run it:

```bash
chmod +x upload-music.sh
./upload-music.sh
```

#### Option 2: Using SCP or SFTP

You can upload your music files using SCP:

```bash
scp -r /path/to/your/music/* username@your-server-ip:/opt/zambian-legends/music/
```

Or use an SFTP client like FileZilla to upload your files.

### 5. Configure Your Domain (Optional)

If you have a domain name, update the Nginx configuration:

1. Edit the Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/zambian-legends
```

2. Replace `your-domain.com` with your actual domain name.

3. Save the file and restart Nginx:

```bash
sudo systemctl restart nginx
```

### 6. Set Up SSL (Optional but Recommended)

To secure your site with HTTPS:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete the SSL setup.

## Managing Your Application

### Viewing Logs

To view the application logs:

```bash
pm2 logs zambian-legends
```

### Restarting the Application

To restart the application:

```bash
pm2 restart zambian-legends
```

### Stopping the Application

To stop the application:

```bash
pm2 stop zambian-legends
```

### Updating the Application

To update the application with the latest changes:

```bash
cd /opt/zambian-legends
git pull
npm install
pm2 restart zambian-legends
```

## Troubleshooting

### Application Not Starting

Check the logs for errors:

```bash
pm2 logs zambian-legends
```

### Nginx Not Working

Check the Nginx status and logs:

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Permission Issues

If you encounter permission issues:

```bash
sudo chown -R $USER:$USER /opt/zambian-legends
chmod -R 755 /opt/zambian-legends
```

## Backup

To backup your music files and application data:

```bash
rsync -avz username@your-server-ip:/opt/zambian-legends/music/ /path/to/local/backup/
```

## Support

If you encounter any issues, please open an issue on the GitHub repository.
