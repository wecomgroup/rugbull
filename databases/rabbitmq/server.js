const { getConnection } = require('../../libary/rabbitmq');
const queueName = 'gameEvent';
const exchange = 'server_exchange';

async function getChannel() {
    const connection = await getConnection();
    const channel = await connection.createChannel();
    // 定义交换
    await channel.assertExchange(exchange, 'direct', {
        durable: true,
    });
    // 定义队列
    await channel.assertQueue(queueName, { durable: true });
    // 绑定队列到交换
    await channel.bindQueue(queueName, exchange, 'routing_key');
    return [connection, channel];
}

const gameInfoKey = "gameInfo";

/**
 * 
 * @param {*} msg string message
 * @returns 
 */
async function setGameInfo(info) {
    try {
        const gameInfo = {
            eventName: gameInfoKey + info.status,
            data: info
        }

        const [connection, channel] = await getChannel();
        await channel.publish(exchange, 'routing_key', Buffer.from(JSON.stringify(gameInfo)));
        await channel.assertQueue(queueName, {
            durable: true
        });
        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(gameInfo)), {
            persistent: true
        });
        connection.close();
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
}

module.exports = setGameInfo;