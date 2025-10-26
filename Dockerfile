FROM docker:27-dind

WORKDIR /app
COPY . /app

RUN apk add --no-cache docker-cli-compose bash git curl
RUN mv test.env .env

CMD ["dockerd-entrypoint.sh"]

