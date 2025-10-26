#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXPORT_DIR="/tmp/cryobs.xyz/build_images"

cleanup() {
  echo "Cleaning up..."
  docker stop cryobs-xyz-test >/dev/null 2>&1 || true
  docker rm -f cryobs-xyz-test >/dev/null 2>&1 || true
  docker image rm cryobs-xyz-test >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Build test image..."
docker build -t cryobs-xyz-test "$SCRIPT_DIR/.."
echo "Start test image..."
docker run --privileged -d --name cryobs-xyz-test cryobs-xyz-test

echo "Waiting for Docker daemon inside container..."
until docker exec cryobs-xyz-test docker info >/dev/null 2>&1; do
  sleep 1
done
echo "Docker daemon is ready!"

echo "Checking network..."
docker exec cryobs-xyz-test sh -c \
  'docker network inspect cloudflare-net >/dev/null 2>&1 || docker network create --driver bridge cloudflare-net'

echo "Starting docker-compose... (it take long)"
docker exec cryobs-xyz-test docker compose up -d

check_container_running() {
  local name="$1"
  docker exec cryobs-xyz-test sh -c "docker inspect -f '{{.State.Running}}' $name 2>/dev/null" | grep -q true
}

echo "Waiting for nginx and php containers..."
for i in $(seq 1 60); do
  if check_container_running cryobs-xyz-nginx && check_container_running cryobs-xyz-php; then
    echo "nginx and php are running!"
    break
  fi
  sleep 2
  [ $i -eq 60 ] && echo "nginx/php not started in time" && exit 1
done


echo "Checking site response..."
docker exec cryobs-xyz-test sh -c 'apk add --no-cache curl >/dev/null'
HTTP_CODE=$(docker exec cryobs-xyz-test sh -c "curl -s -o /dev/null -w '%{http_code}' http://localhost")

if [ ! "$HTTP_CODE" = "200" ]; then
  echo "Site responded with code $HTTP_CODE"
  docker exec cryobs-xyz-test docker ps
  docker exec cryobs-xyz-test docker logs cryobs-xyz-nginx || true
  docker exec cryobs-xyz-test docker logs cryobs-xyz-php || true
  exit 1
else
  echo "Site responded successfully (HTTP 200)."
fi


echo "Exporting built images from inner Docker..."

docker exec cryobs-xyz-test sh -c '
  mkdir -p /tmp/export &&
  for image in $(docker images --format "{{.Repository}}:{{.Tag}}" | grep cryobs-xyz); do
    echo "Saving $image..."
    docker save "$image" -o "/tmp/export/$(echo "$image" | tr "/:" "__").tar"
  done
'

mkdir -p "$EXPORT_DIR"
docker cp cryobs-xyz-test:/tmp/export/. "$EXPORT_DIR"

echo "Exported images saved to: $EXPORT_DIR"
