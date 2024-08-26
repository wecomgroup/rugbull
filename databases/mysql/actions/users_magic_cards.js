const {
    Op,
} = require("sequelize");


module.exports = function (db, model) {

    const methods = {
        /*speedCardKey: "speedup",
        async useSpeedCard(userId, speedDuration) {
            // 用戶當前狀態是否已經擁有加速卡
            const uping = await model.findOne({
                attributes: ["rowId"],
                where: {
                    userId,
                    cardType: this.speedCardKey,
                    expirationTime: {
                        [Op.gte]: new Date().getTime()
                    }
                }
            });
            if (uping) {
                await model.increment({
                    expirationTime: speedDuration
                }, {
                    where: {
                        rowId: [uping.rowId]
                    }
                })
            } else {
                await model.create({
                    expirationTime: +new Date() + speedDuration,
                    cardType: this.speedCardKey,
                })
            }
        },
        useExpandCard() {

        },
        useDoubleWiningCard() {

        },*/
        async findActiveCards(userId) {
            return model.findAll({
                where: {
                    userId,
                    expirationTime: {
                        [Op.gte]: new Date().getTime()
                    }
                }
            });
        }
    }

    model = Object.assign(model, methods);
    return model;
}