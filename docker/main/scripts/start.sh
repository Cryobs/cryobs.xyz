#!/bin/sh
set -e 

echo "Starting cron..."
crond -f -l 2 &

echo "Starting server..."
exec ./server

