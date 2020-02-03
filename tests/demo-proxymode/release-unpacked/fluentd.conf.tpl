# We listen to all trafic on the local port. We rely on docker to ensure
# that we can only receive values from local containers.
<source>
  @type forward
  port  24224
</source>

# We've configured nginx to generate logs in json format, one entry per line.
# Hence parse that here.
<filter docker.nginx>
  @type parser
  format json
  key_name log
  time_key time_local
  time_format %d/%b/%Y:%H:%M:%S %z
</filter>

# Add a component tag for logs from nginx
<filter docker.nginx>
  @type record_transformer
  <record>
    component "nginx"
  </record>
</filter>

# Add a component tag for logs from the appserver
<filter java.frontend>
  @type record_transformer
  <record>
    component "frontend"
  </record>
</filter>

# Add our other standard tags to all log items
# including the elasticsearch index to use
<filter *.*>
  @type record_transformer
  enable_ruby true
  <record>
    client "helix"
    system "malabar"
    env {{infrastructure.environment.name}}
    codeVersion agonics-v1.3.0
    @es_index flip-malabar-${time.strftime('%Y.%m.%d')}
  </record>
</filter>

<match **>
  @type copy
  <store>
    @type forward
    send_timeout 60s
    recover_wait 10s
    heartbeat_interval 1s
    phi_threshold 16
    hard_timeout 60s

    transport tls
    tls_cert_path /fluentd/etc/certificate.crt

    heartbeat_type tcp

    dns_round_robin true

    <server>
      name fluentd-aggregator
      host logging.aws.helixta.com.au
      port 24224
      weight 60
    </server>
  </store>

  <store>
    @type stdout
  </store>
</match>