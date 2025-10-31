#!/bin/sh
set -e 

ls /app

echo "Starting cron..."
crond -l 2 &

echo "Starting server..."
./server

