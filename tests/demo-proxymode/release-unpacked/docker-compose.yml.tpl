version: "2.2"

services:
  nginx:
    image: {{infrastructure.ecr_nginx}}:agonics-v1.3.0
    ports:
      - {{ports.http}}:80
    links:
      - appserver
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt

    # nginx writes logs to standard out, so we rely on the docker logging
    # to forward the output to the fluentd container
    depends_on:
      - fluentd
    logging:
      driver: fluentd
      options:
        fluentd-address: "localhost:{{ports.extra1}}"
        tag: "docker.nginx"

  appserver:
    image: {{infrastructure.ecr_appserver}}:agonics-v1.3.0
    ports:
      - 8080
    links:
      - fluentd:fluentd
    environment:
      - JAVA_OPTS="-Xmx2g"
    volumes:
      - ./appserver.cfg:/config/appserver.cfg
    # The java servers log directly to the fluentd container, so no
    # need for docker logging here
    depends_on:
      - fluentd

  fluentd:
    image: fluent/fluentd:v0.14
    ports:
        - {{ports.extra1}}:24224
        - 24224/udp
    volumes:
      - ./fluentd.conf:/fluentd/etc/fluentd.conf:ro
      - ./certificate.crt:/fluentd/etc/certificate.crt:ro
    environment:
      - FLUENTD_CONF=fluentd.conf
