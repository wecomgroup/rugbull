const {
    Op,
} = require("sequelize");

module.exports = function (db, model) {

    const methods = {
        async updateEnergy(rowId, amount, transaction) {
            const user = await model.findOne({ where: { rowId } }, { transaction });
            const now = new Date();
            const secondsPassed = Math.floor((now - user.lastUpdateTime) / 1000);
            const potentialEnergyGain = secondsPassed * user.energyAccumulationRate;
            const currentEnergy = Math.min(user.currentEnergy + potentialEnergyGain, user.energyCapacity);

            if (currentEnergy < amount) {
                throw new Error('Not enough energy');
            }

            const newEnergy = currentEnergy - amount;
            const dailyLimitTime = Math.ceil(((user.energyCapacity - newEnergy) / user.energyAccumulationRate) * 1000) + now.getTime();
            await model.update({
                currentEnergy: newEnergy,
                lastUpdateTime: now,
                dailyLimitTime
            }, {
                where: { rowId },
                transaction
            });
            return newEnergy;
        },
        async updateEnergyCapacity(rowId, newCapacity, transaction) {
            const user = await model.findOne({ where: { rowId } }, { transaction });
            if (!user) {
                throw new Error('User not found');
            }

            await model.update({
                energyCapacity: newCapacity
            }, {
                where: { rowId },
                transaction
            });

            return await model.findOne({ where: { rowId } }, { transaction });
        }
    }

    model = Object.assign(model, methods);
    return model;
}