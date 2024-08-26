const users = require('./users');
const bot_info = require('./bot_info');
const users_wallet = require('./users_wallet');
const users_bet = require('./users_bet');
const users_energy = require('./users_energy');
const magic_cards = require('./magic_cards');
const users_magic_cards = require('./users_magic_cards');
const users_magic_card_totals = require('./users_magic_card_totals');
const game_results = require('./game_results');


function initActions(db) {

    db.game_results = game_results(db, db.game_results);
    db.game_results.hasMany(db.users_bet, {
        foreignKey: 'round',
        sourceKey: 'round'
    });

    db.users_bet.belongsTo(db.game_results, {
        foreignKey: 'round',
        sourceKey: 'round'
    });

    db.users = users(db, db.users);
    db.users_bet = users_bet(db, db.users_bet);
    db.bot_info = bot_info(db, db.bot_info);
    db.users_wallet = users_wallet(db, db.users_wallet);
    db.users_energy = users_energy(db, db.users_energy);
    db.magic_cards = magic_cards(db, db.magic_cards);
    db.users_magic_cards = users_magic_cards(db, db.users_magic_cards);
    db.users_magic_card_totals = users_magic_card_totals(db, db.users_magic_card_totals);

    return db;
}

module.exports = initActions;
module.exports.initActions = initActions;
module.exports.default = initActions;
