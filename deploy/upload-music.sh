#!/bin/bash
# Script to upload music files to your VPS
# Run this script on your local machine

# Configuration
SERVER_USER="your-username"  # Replace with your VPS username
SERVER_IP="your-server-ip"   # Replace with your VPS IP address
REMOTE_MUSIC_DIR="/opt/zambian-legends/music"
LOCAL_MUSIC_DIR="./music"    # Replace with the path to your local music directory

# Check if local music directory exists
if [ ! -d "$LOCAL_MUSIC_DIR" ]; then
    echo "Error: Local music directory $LOCAL_MUSIC_DIR does not exist."
    exit 1
fi

# Count music files
MUSIC_FILES=$(find "$LOCAL_MUSIC_DIR" -type f -name "*.mp3" -o -name "*.flac" -o -name "*.wav" -o -name "*.ogg" -o -name "*.m4a" | wc -l)

echo "Found $MUSIC_FILES music files to upload."
echo "This may take a while depending on your internet connection speed."
echo "Uploading music files to $SERVER_USER@$SERVER_IP:$REMOTE_MUSIC_DIR..."

# Upload files using rsync
rsync -avz --progress "$LOCAL_MUSIC_DIR/" "$SERVER_USER@$SERVER_IP:$REMOTE_MUSIC_DIR/"

echo "Upload complete!"
echo "You can now access your music through the web application."
