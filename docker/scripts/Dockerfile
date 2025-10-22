FROM alpine:latest

RUN apk add --no-cache bash curl dcron

WORKDIR /app

COPY ./docker/scripts/ .
COPY ./docker/scripts/cronjob /etc/crontabs/root

RUN chmod +x status-check.sh

CMD ["crond", "-f", "-l", "2"]
