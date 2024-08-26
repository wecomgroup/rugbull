const { Op } = require("sequelize");

module.exports = function (db, model) {

    const methods = {
        async incrementTotals(userId, type, expirationDuration, poolSizeIncrement, transaction) {
            const currentTotal = await model.findOne({
                where: { userId, type },
                transaction
            });

            if (currentTotal) {
                const currentExpirationTime = new Date(currentTotal.totalExpirationTime);
                const now = new Date();

                let newExpirationTime;
                // 還沒過期的話 延長
                if (currentExpirationTime > now) {
                    newExpirationTime = db.client.sequelize.fn(
                        'DATE_ADD',
                        db.client.sequelize.col('totalExpirationTime'),
                        db.client.sequelize.literal(`INTERVAL ${expirationDuration} SECOND`)
                    );
                } else {
                    // 已過期的話用現在時間 + expirationDuration
                    newExpirationTime = new Date(now.getTime() + (expirationDuration * 1000));
                }

                await model.update({
                    totalExpirationTime: newExpirationTime,
                    totalPoolSize: db.client.sequelize.literal(`totalPoolSize + ${poolSizeIncrement}`)
                }, {
                    where: { userId, type },
                    transaction
                });
            } else {
                const newExpirationTime = new Date(Date.now() + (expirationDuration * 1000));
                await model.create({
                    userId,
                    type,
                    totalExpirationTime: type === 'Expand pool'
                        ? new Date('2038-01-19 03:14:00')
                        : newExpirationTime,
                    totalPoolSize: poolSizeIncrement,
                }, { transaction });
            }
        },
        async findUserTotals(userId, type, transaction) {
            return await model.findOne({
                where: { userId, type },
                transaction
            });
        }
    }

    model = Object.assign(model, methods);
    return model;
}