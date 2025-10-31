#!/bin/bash
set -e 
WORK_DIR="$(cd "$(dirname "$0")" && pwd)/.."
PROJECT="cryobx-xyz-test"
docker-compose -f $WORK_DIR/test-compose.yml \
              -p $PROJECT \
              up -d 
cleanup() {
  echo "Cleanup..."
  docker-compose -f $WORK_DIR/test-compose.yml \
                -p $PROJECT \
                down
}
trap cleanup EXIT
check_container_running() {
  local name="$1"
  docker inspect -f '{{.State.Running}}' $name 2>/dev/null | grep -q true
}
echo "Waiting for containers..."
CONTAINERS=(
  "${PROJECT}-mariadb"
  "${PROJECT}-bot"
  "${PROJECT}-main"
)
for i in $(seq 1 60); do
  all_running=true
  for c in "${CONTAINERS[@]}"; do
    if ! check_container_running "$c"; then
      all_running=false
      break
    fi
  done
  if $all_running; then
    echo "All containers are running!"
    break
  fi
  sleep 1
  [ $i -eq 60 ] && echo "Containers not started in time" && exit 1
done

#Here starts tests
echo "Checking site response..."
echo "Waiting for site to be ready..."

for i in $(seq 1 30); do
  HTTP_CODE=$(docker exec $PROJECT-main curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>&1 || echo "000")
  echo "Attempt $i/30: Got HTTP $HTTP_CODE"
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "Site responded successfully (HTTP 200)."
    exit 0
  fi
  sleep 1
done

echo "Site did not respond with HTTP 200 in time"
echo "===== main logs ====="
docker logs "${PROJECT}-main"
exit 1
