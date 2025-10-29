#!/bin/bash

# Script that checks url availability
# and write to DB

mapfile -t URLS < <(mariadb -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -Bse \
  "SELECT url FROM sys_status;")


mapfile -t NAMES < <(mariadb -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -Bse \
  "SELECT name FROM sys_status;")

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

