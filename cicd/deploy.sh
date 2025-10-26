#!/bin/sh
set -e
WORK_DIR=$1
REPO_URL="/home/git/pub/cryobs.xyz.git"

echo "Start deploying..."

if [ ! -f "$WORK_DIR/.env" ]; then
    echo "ERROR: .env not found in $WORK_DIR"
    echo "Please create .env file first"
    exit 1
fi

echo "Backing up .env..."
ENV_BACKUP="/tmp/.env.backup.$$"
cp "$WORK_DIR/.env" "$ENV_BACKUP"

if [ -f "$WORK_DIR/docker-compose.yml" ]; then
    echo "Stopping containers..."
    cd "$WORK_DIR"
    docker-compose down || true
fi

echo "Cleaning work directory..."
cd /
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

echo "Cloning repository..."
git clone "$REPO_URL" "$WORK_DIR"
cd "$WORK_DIR"

echo "Restoring .env..."
cp "$ENV_BACKUP" "$WORK_DIR/.env"
rm "$ENV_BACKUP"

echo "Starting new version..."
docker-compose up -d --build

echo "Deployment complete!"
