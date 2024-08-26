const db = require('./base');
const initActions = require('./actions/init-actions');


const fullDb = initActions(db);

fullDb.users.hasMany(fullDb.users_bet, {
    foreignKey: "userRowId",
    sourceKey: "rowId"
})

fullDb.users_bet.belongsTo(fullDb.users, {
    foreignKey: "userRowId",
    sourceKey: "rowId"
})


fullDb.users_bet.hasOne(fullDb.game_results, {
    foreignKey: "round",
    sourceKey: "round"
})


fullDb.game_results.hasMany(fullDb.users_bet, {
    foreignKey: "round",
    sourceKey: "round"
})

module.exports = fullDb;
