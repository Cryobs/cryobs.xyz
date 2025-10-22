#!/bin/sh
set -e

git config --global --add safe.directory /var/www || true

echo "PHP container started at $(date)"

if [ -d /var/www/.git ]; then
    COMMIT=$(git --git-dir=/var/www/.git --work-tree=/var/www rev-parse --short HEAD 2>/dev/null || echo "N/A")
    echo "Current commit: $COMMIT"
fi

exec php-fpm

