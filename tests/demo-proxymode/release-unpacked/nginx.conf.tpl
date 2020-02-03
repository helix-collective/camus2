user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configure json format logging for downstream processing
    # by fluentd
    log_format json_combined escape=json
      '{ "time_local" : "$time_local" '
      ', "remote_addr": "$remote_addr" '
      ', "request_method": "$request_method" '
      ', "request_uri": "$request_uri" '
      ', "status": $status'
      ', "bytes_sent": $bytes_sent'
      ', "request_time": $request_time'
      '}';

    access_log  /var/log/nginx/access.log json_combined;
    error_log   /var/log/nginx/error.log;

    sendfile        on;

    keepalive_timeout  65;

    # Proxy response control
    proxy_buffering on;
    proxy_temp_path proxy_temp 1 2;
    proxy_http_version 1.1;

    gzip on;
    gzip_proxied any;
    gzip_types
        text/css
        text/javascript
        text/xml
        text/plain
        application/javascript
        application/x-javascript
        application/json;

    # Assume textual mime-types are utf8 and set charset header accordingly
    charset utf-8;

    server {
        listen       80 default_server;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            add_header Cache-Control "public, max-age=60";

            # The try_files directive ensures that everything under the "/"
            # root is directed to "index.html"
            # $uri is defined as the current URI in request.
            # This means the try_files first checks if the $uri works (doesn't return 404).
            # If the $uri contains "/_a" this is automatically redirected to the proxy below.
            # Otherwise a 404 is returned and we are opaquely sent to "index.html".
            try_files $uri /index.html;
        }

        location = /_a {
           return 302 /_a/;
        }

        location /_a/ {
          proxy_pass http://appserver:8081/_a/;
        }

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
