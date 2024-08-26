const env = require('./env');


module.exports = {
    host: env.rabbitmq.rabbitmq_host,
    port: env.rabbitmq.rabbitmq_port,
    user: env.rabbitmq.rabbitmq_user,
    pass: env.rabbitmq.rabbitmq_password,
    vhost:env.rabbitmq.rabbitmq_vhost,
}