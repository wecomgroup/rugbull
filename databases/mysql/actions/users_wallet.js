const {
    Op,
    Sequelize
} = require("sequelize");


module.exports = function (db, model) {

    const methods = {
        async decrementBalance(rowId, amount, updateType, updpateRemark, transaction) {
            const result = await model.update({
                userBonus: Sequelize.literal(`userBonus - ${amount}`),
                lastUpdateType: updateType,
                lastUpdateRemark: updpateRemark
            }, {
                where: {
                    rowId,
                    userBonus: {
                        [Op.gte]: amount
                    }
                },
                transaction
            });
            if (!db.result(result)) {
                throw new Error('Not enough balance');
            }
            return true;
        },
        async incrementBalance(rowId, amount, updateType, updpateRemark, transaction) {
            const result = await model.update({
                userBonus: Sequelize.literal(`userBonus + ${amount}`),
                lastUpdateType: updateType,
                lastUpdateRemark: updpateRemark
            }, {
                where: {
                    rowId,
                },
                transaction
            });
            return result;
        }
    }

    model = Object.assign(model, methods);
    return model;
}