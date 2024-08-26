const _game_results = require('./gameRecord');

function initModels(mongoose) {
    const game_results = mongoose.model(_game_results.modelName, _game_results.schema);
    return {
        game_results,
    };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
