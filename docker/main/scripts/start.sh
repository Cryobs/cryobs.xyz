#!/bin/sh
set -e 

echo "Starting cron..."
crond -l 2 &

echo "Starting server..."
./server

