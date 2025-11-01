#!/bin/bash

# Script that checks url availability
# and write to DB

mapfile -t URLS < <(mariadb -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -Bse \
  "SELECT url FROM sys_status;")


mapfile -t NAMES < <(mariadb -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -Bse \
  "SELECT name FROM sys_status;")

for i in ${!URLS[@]}; do 
  status_code=$(curl -isL ${URLS[$i]} | head -1 | cut -d " " -f 2);
  if  [[ "$status_code" = "200" ]]; then
    status="OK"
  else
    status="ERROR"
  fi
  echo "${URLS[$i]}; ${NAMES[$i]}; $status_code"
  mariadb -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -Bse \
    "REPLACE INTO sys_status (url, name, status) VALUES ('${URLS[$i]}', '${NAMES[$i]}', '$status');"
done

