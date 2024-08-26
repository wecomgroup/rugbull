const {
    Op,
    QueryTypes
} = require("sequelize");


module.exports = function (db, model) {

    const methods = {
        async checkUnsettledOrders() {
            const lastGame = await db.game_results.findOne({
                attributes: [
                    'id',
                    'round'
                ],
                where: {
                    state: 1
                },
                raw: true,
                order: [['round', 'desc']]
            });
            if (lastGame) {
                const roundList = await db.users_bet.findAll({
                    attributes: [
                        'round'
                    ],
                    where: {
                        round: {
                            [Op.lt]: lastGame.round,
                        },
                        state: 0
                    },
                    include: [{
                        model: db.game_results,
                        required:true,
                        attributes:[
                            'encryption'
                        ]
                    }],
                    raw: true,
                    nest: true,
                    group: ['round']
                });
                return roundList;
            }
            return [];
        }
    }
    model = Object.assign(model, methods);
    return model;
}