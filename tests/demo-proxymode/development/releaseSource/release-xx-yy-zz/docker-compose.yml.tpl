version: "3"
services:
  web:
    # replace username/repo:tag with your name and image details
    image: httpd
    ports:
      - "{{ports.http}}:80"
    volumes:
      - .:/usr/local/apache2/htdocs/
