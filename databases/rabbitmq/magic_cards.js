const { getConnection } = require('../../libary/rabbitmq');
const queueName = 'magic_cards';
const exchange = 'magic_cards_exchange';

async function getChannel() {
    const connection = await getConnection();
    const channel = await connection.createChannel();

    // 定义延迟交换
    await channel.assertExchange(exchange, 'x-delayed-message', {
        durable: true,
        arguments: {
            'x-delayed-type': 'direct'
        }
    });

    // 定义队列
    await channel.assertQueue(queueName, { durable: true });

    // 绑定队列到延迟交换
    await channel.bindQueue(queueName, exchange, 'routing_key');
    return [connection, channel];
}


/**
 * 
 * @param {*} msg string message
 * @param {*} delay ms 
 * @returns 
 */
async function setNewJob(msg, delay) {
    try {
        const [connection, channel] = await getChannel();

        await channel.publish(exchange, 'routing_key', Buffer.from(JSON.stringify(msg)), {
            headers: {
                'x-delay': delay * 1000
            }
        });
        await channel.assertQueue(queueName, {
            durable: true
        });
        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
            persistent: true
        });
        connection.close();
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
}

async function lisenJob(callback) {
    try {
        const [connection, channel] = await getChannel();

        // 确保队列存在
        await channel.assertQueue(queueName, { durable: true });

        // 监听队列中的消息
        channel.consume(queueName, (msg)=>callback(msg,channel), {
            noAck: false
          });
    } catch (error) {
        console.error(error);
    }
    return false;
}

module.exports = {
    setNewJob,
    lisenJob
}