const {
    Op,
    QueryTypes,
    Sequelize
} = require("sequelize");

module.exports = function (db, model) {

    const methods = {
        async setGameWin(round, multiplier) {
            const checkPoint = new Date().getTime();
            const result = await db.client.sequelize.query(`UPDATE users_wallet JOIN users_bet ON users_wallet.rowId = users_bet.userRowId
                SET users_bet.state= 1,
                    users_bet.updatedAt=NOW(),
                    users_bet.isWin=1,
                    users_bet.checkPoint=:checkPoint,
                    users_wallet.userBonus=users_wallet.userBonus + ((users_bet.amount * (users_bet.multiplier - 1) * users_bet.winMultiplier) + users_bet.amount),
                    users_wallet.lastUpdateType='win',
                    users_wallet.lastUpdateRemark=:round
                                                            WHERE users_bet.round = :round and users_bet.state=0 and users_bet.isAuto=1 and users_bet.multiplier <= :multiplier`, {
                type: QueryTypes.UPDATE,
                replacements: {
                    round,
                    multiplier,
                    checkPoint
                },
            });
            if (db.result(result)) {
                return checkPoint
            }
            return false;
        }
        ,
        async setGameLost(round, multiplier) {
            return Promise.all([
                model.update({
                    state: 1,
                    isWin: 0,
                    isAuto: 1
                }, {
                    where: {
                        state: 0,
                        round,
                        multiplier: {
                            [Op.gt]: multiplier
                        }
                    }
                }),
                model.update({
                    state: 1,
                    isWin: 0,
                    isAuto: 1
                }, {
                    where: {
                        state: 0,
                        round,
                        isAuto: 0
                    }
                }),
            ]);
        },
        async gameWinnerList(checkPoint) {
            const limit = 10;
            const winList = await model.findAll({
                attributes: [
                    `id`,
                ],
                where: {
                    checkPoint
                },
                order: [['updatedAt', 'desc']],
                limit,
                raw: true
            });
            return winList;
        },
        async gameWinnerListDetails(gameIdList) {
            const userList = await model.findAll({
                attributes: [
                    `id`,
                    `multiplier`,
                    `winMultiplier`,
                    'round',
                    `amount`,
                ],
                include: [
                    {
                        model: db.users,
                        as: "user",
                        attributes: [
                            `rowId`,
                            `firstName`,
                            `lastName`,
                        ],
                    },
                ],
                where: {
                    id: gameIdList
                },
                raw: true,
                nest: true
            });
            const details = userList.map(item => {
                return {
                    multiplier: item.multiplier,
                    amount: item.amount,
                    winMultiplier: item.winMultiplier,
                    win: (Number(item.amount) * (item.multiplier - 1) * item.winMultiplier) + Number(item.amount),
                    userId: item.user.rowId,
                    nickName: [item.user.firstName, item.user.lastName].join(' ').trim(),
                }
            });
            return details;
        },
        async getUserProcessGame(userRowId) {
            return await model.findAll({
                attributes: [
                    ['id', 'recordId'],
                    'amount',
                    'round',
                    ['isAuto', 'auto'],
                    'multiplier',
                    'betTime',
                    'coinType'
                ],
                where: {
                    userRowId,
                    state: 0
                },
                limit: 2,
                nest: true,
                raw: true
            })
        },
        async setResult(round, multiplier) {
            return model.update({
                result: multiplier
            }, {
                where: {
                    round
                }
            })
        }
    }
    model = Object.assign(model, methods);
    return model;
}