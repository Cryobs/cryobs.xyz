#!/bin/bash

# Script that checks url availability
# and write to DB

URLS=( 
  "https://cryobs.xyz"
  "http://192.168.100.14:8080/login" 
  "http://192.168.100.14:4533/app" 
)

NAMES=(
  "cryobs.xyz"
  "File Server"
  "Music Server"
)

for i in ${!URLS[@]}; do 
  status=$(curl -Is ${URLS[$i]} | head -1 | cut -d " " -f 2);
  if  [[ "$status" = "200" ]]; then
    status="OK"
  else
    status="ERROR"
  fi
  mariadb -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -Bse \
    "REPLACE INTO sys_status (url, name, status) VALUES ('${URLS[$i]}', '${NAMES[$i]}', '$status');"
done

