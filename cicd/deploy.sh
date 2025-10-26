#!/bin/sh
set -e

WORK_DIR=$1
REPO_URL="~/pub/cryobs.xyz.git"

echo "Start deploying..."

if [ -d "$WORK_DIR/.git" ]; then
    echo "Existing repo found, pulling latest changes..."
    cd "$WORK_DIR"
    git pull origin main >/dev/null 2>&1
else
    echo "No repo found, cloning new one..."
    mkdir -p "$WORK_DIR"
    git clone "$REPO_URL" "$WORK_DIR"
    cd "$WORK_DIR"
fi

if [ ! -d "$WORK_DIR/.env" ]; then
    echo "Please login to the server and create a .env in $WORK_DIR, and run deploy.sh"
    exit 1
fi

echo "Build new version..."
docker-compose build

echo "Run new version..."
docker-compose up -d

echo "Deployment complete!"
