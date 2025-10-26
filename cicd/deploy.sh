#!/bin/sh
set -e
WORK_DIR=$1
REPO_URL="/home/git/pub/cryobs.xyz.git"
IMPORT_DIR="/tmp/cryobs.xyz/build_images"

echo "Start deploying..."

if [ -d "$WORK_DIR/.git" ]; then
    echo "Existing repo found, pulling latest changes..."
    cd "$WORK_DIR"
    echo "Pull from $REPO_URL to $(pwd)"
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git pull "$REPO_URL" || {
            echo "Pull failed, trying to reinitialize..."
            rm -rf .git
            git clone "$REPO_URL" "$WORK_DIR-tmp"
            rm -rf "$WORK_DIR"
            mv "$WORK_DIR-tmp" "$WORK_DIR"
            cd "$WORK_DIR"
        }
    else
        echo ".git exists but is not a valid git repository, reinitializing..."
        rm -rf .git
        git init
        git remote add origin "$REPO_URL"
        git fetch origin
        git reset --hard origin/main    
    fi

else
    echo "No repo found, cloning new one..."
    rm -rf "$WORK_DIR"
    mkdir -p "$(dirname "$WORK_DIR")"
    git clone "$REPO_URL" "$WORK_DIR"
    cd "$WORK_DIR"
fi

if [ ! -f "$WORK_DIR/.env" ]; then
    echo "Please login to the server and create a .env in $WORK_DIR, and run deploy.sh"
    exit 1
fi

echo "Run new version..."
cd "$WORK_DIR"
docker-compose up -d --build

echo "Deployment complete!"
