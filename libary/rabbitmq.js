const amqp = require('amqplib');
const config = require('../config/rabbitmq');

async function getConnection() {
    const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: config.host,
        port: config.port,
        username: config.user,
        password: config.pass,
        vhost: config.vhost
    });
    return connection;
}

module.exports = {
    getConnection
};