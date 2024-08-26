const { getConnection } = require('../../libary/rabbitmq');
const db = require('../../databases/mysql');
const emit = require('../../libary/socketEmit');
const redis = require('../../databases/redis')


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

async function listenForMessages() {
    try {
        const [connection, channel] = await getChannel();
        // 监听队列中的消息
        await channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                const payload = JSON.parse(messageContent);
                console.log(payload);
                switch (payload.eventName) {
                    case 'gameInfo1':
                        const gameList = await db.game_results.checkUnsettledOrders();
                        for (let item of gameList) {
                            await Promise.all([
                                db.users_bet.setGameWin(item.round, item.multiplier),
                                db.users_bet.setGameLost(item.round, item.multiplier),
                                db.users_bet.setResult(item.round, item.multiplier),
                            ]);
                        }
                        await redis.setGameInfo(payload.data);
                        await emit.gameEvent(payload.data);
                        break;
                    case 'gameInfo2':
                        const checkPoint = await db.users_bet.setGameWin(payload.data.round, payload.data.multiplier);
                        if (checkPoint) {
                            const winList = await db.users_bet.gameWinnerList(checkPoint);
                            if (winList.length > 0) {
                                const gameIdList = winList.map(item => item.id);
                                const pushInfo = await db.users_bet.gameWinnerListDetails(gameIdList);
                                await emit.userEscapes({
                                    userList: pushInfo,
                                    multiplier: payload.data.multiplier
                                });
                            }
                            await emit.checkPoint(checkPoint);
                        }
                        await redis.setGameInfo(payload.data);
                        await emit.gameEvent(payload.data);
                        break;

                    case 'gameInfo3':
                        delete payload.data.rowData.id;
                        await Promise.all([
                            db.game_results.create(Object.assign(payload.data.rowData, { multiplier: payload.data.multiplier })),
                            db.users_bet.setGameWin(payload.data.round, payload.data.multiplier),
                            db.users_bet.setGameLost(payload.data.round, payload.data.multiplier),
                            db.users_bet.setResult(payload.data.round, payload.data.multiplier),
                        ]);
                        await redis.setGameInfo(payload.data);
                        await emit.gameEvent(payload.data);
                        break;

                    default:
                        console.log(`Unhandled payload type: ${payload.data.type}`);
                }
                channel.ack(msg);
            }
        }, {
            noAck: false // 需要手动确认消息
        });

        console.log(`Listening for messages on queue: ${queueName}`);
    } catch (err) {
        console.error(err);
    }
}

module.exports = { listenForMessages, getChannel };
