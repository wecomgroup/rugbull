
module.exports = function (db, model) {

    const methods = {
        async getAllMagicCards() {
            return await model.findAll({
                attributes: [
                    'rowId',
                    'name',
                    'type',
                    'description',
                    'duration',
                    'effect_amount',
                    'price',
                    'createdAt',
                    'updatedAt'
                ],
                raw: true,
                nest: true
            });
        },
        async getMagicCardById(rowId) {
            return await model.findOne({
                where: { rowId },
                attributes: [
                    'rowId',
                    'name',
                    'type',
                    'description',
                    'duration',
                    'effect_amount',
                    'price',
                    'createdAt',
                    'updatedAt'
                ],
                raw: true,
                nest: true
            });
        }
    };

    model = Object.assign(model, methods);
    return model;
};