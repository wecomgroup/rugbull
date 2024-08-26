const adapter = require('./socketAdapter');
const { Server } = require('socket.io');
const db = require('../databases/mysql');
const ioredis = require('../databases/redis');
const Boom = require('@hapi/boom');
const { logger } = require('./logs2');
const logs = new logger({
    service: 'socketEmit'
})
const client = new Server({
    adapter,
    serveClient: false
});


const allEvent = {
    gameEventName: "gameEvent",
    async gameEvent(payload) {
        client.emit(this.gameEventName, payload);
        return true;
    },
    async logoutUser(userId,message){
        const loginInfo = await ioredis.getUserLoginInfo(userId);
        client.to(loginInfo.socketId).disconnectSockets(true);
        return true;
    },
    userEscapesName: "userEscapes",
    async userEscapes(payload) {
        client.emit(this.userEscapesName, payload);
        return true;
    },
    trumpetOfVictoryName: "trumpetOfVictory",
    async trumpetOfVictory(userId, payload) {
        const loginInfo = await ioredis.getUserLoginInfo(userId);
        client.to(loginInfo.socketId).emit(this.trumpetOfVictoryName, payload);
        return true;
    },
    changeBalanceName: "balanceEvent",
    async changeBalance(userId, coinType = 1) {
        let payload;
        if (coinType === 2) {
            payload = await this.changeUnlockCoin(userId)
        } else {
            payload = await this.changeLockCoin(userId)
        }
        payload.coinType = coinType;
        const loginInfo = await ioredis.getUserLoginInfo(userId);
        await client.to(loginInfo.socketId).emit(this.changeBalanceName, payload);
        return true;
    },
    async changeLockCoin(userId) {
        const userEnergy = await db.users_energy.findOne({
            attributes: [
                'currentEnergy',
                'energyCapacity',
                'lastUpdateTime',
                'energyAccumulationRate',
                'dailyLimitTime'
            ],
            where: {
                rowId: userId
            },
            raw: true,
        });
        return userEnergy;
    },
    async changeUnlockCoin(userId) {
        const userWallet = await db.users_wallet.findOne({
            attributes: ['userBonus'],
            where: {
                rowId: userId
            },
            raw: true,
        });
        return userWallet;
    },
    async checkPoint(checkPoint) {
        const limit = 500;
        const totalRows = await db.users_bet.count({
            where: {
                checkPoint
            }
        });
        if (totalRows > 0) {
            for (let page = 1; page <= Math.ceil(totalRows / limit); page++) {
                const betInfo = await db.users_bet.findAll({
                    attributes: [
                        'id',
                        'userRowId',
                        'multiplier',
                        'round',
                        'amount',
                    ],
                    include: [
                        {
                            model: db.users_wallet,
                            as: "userRow",
                            attributes: [
                                'userBonus'
                            ]
                        }
                    ],
                    where: {
                        checkPoint,
                        isWin: 1
                    },
                    limit,
                    offset: (page - 1) * limit,
                    raw: true,
                    nest: true
                });
                for (let user of betInfo) {
                    const msgData = {
                        recordId: user.id,
                        userId: user.userRowId,
                        amount: user.amount,
                        multiplier: user.multiplier,
                        newBalance: user.userRow.userBonus
                    }
                    this.trumpetOfVictory(user.userRowId, msgData);
                    this.changeBalance(user.userRowId, 2);
                }
            }
        }
        return true;
    }
}

module.exports = allEvent