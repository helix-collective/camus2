{
  context: "appserver",

  port: 8081,
  environment: "{{infrastructure.environment.name}}",
  region: "{{infrastructure.region}}",
  releaseName: "agonics-v1.3.0",

  region: "fromInstance",
  awsCredentials: "useInstanceProfile",

  cronSharedSecret: "{{cron.secret}}",
  jwtSecret: "{{secrets.jwtSecret}}",
  internalPathSecret: "{{secrets.internalPathSecret}}",

  db: {
    host: "{{infrastructure.database.address}}",
    port: {{infrastructure.database.port}},
    dbname: "{{infrastructure.database.name}}",
    user: "{{infrastructure.database.username}}",
    password: "{{db_password.db-password}}"
  },

  threadPool: {
    maxThreads: 10,
    minThreads: 2,
    idleTimeoutMillis: 10000,
    queueSize: 100
  },

  logging: {
    stdout: {
      level: "DEBUG"
    },
    fluentd : {
      level: "INFO",
      hostname: "fluentd",
      port: 24224,
      tag: "java.frontend"
    }

{{#secrets.rollbar_server_token}}
    ,rollbar : {
      level: "ERROR",
      serverToken: "{{secrets.rollbar_server_token}}"
    }
{{/secrets.rollbar_server_token}}
  },

  clientLogging: {
{{#secrets.rollbar_client_token}}
    rollbar : {
      accessToken: "{{secrets.rollbar_client_token}}"
    }
{{/secrets.rollbar_client_token}}
  },

  jobQueue: {
    queueUrl: "{{infrastructure.sqs_queue.id}}"
  }
}
