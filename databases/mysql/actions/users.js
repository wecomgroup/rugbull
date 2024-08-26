
module.exports = function (db, model) {

    const methods = {
        async addUser({ username, firstName, lastName, userParent = 0, userId, languageCode = 'en' }) {
            const lastTime = new Date();
            return model.upsert({
                userId, username, firstName, lastName, userParent, lastTime, languageCode
            }, {
                username, firstName, lastName, lastTime, languageCode
            });
        },
        async initUserInfo(rowId) {
            return await model.findOne({
                where: {
                    rowId
                },
                attributes: [
                    ['rowId', 'userId'],
                    'languageCode',
                    'firstName',
                    'lastName'
                ],
                include: [
                    {
                        model: db.users_energy,
                        attributes:[
                            'currentEnergy',
                            'energyCapacity',
                            'lastUpdateTime',
                            'energyAccumulationRate',
                            'dailyLimitTime'
                        ],
                        as: "users_energy"
                    },
                    {
                        model: db.users_wallet,
                        attributes:['userBonus'],
                        as: "users_wallet"
                    }
                ],
                raw: true,
                nest: true
            });
        }
    }

    model = Object.assign(model, methods);
    return model;
}