var DataTypes = require("sequelize").DataTypes;
var _bot_info = require("./bot_info");
var _game_results = require("./game_results");
var _magic_cards = require("./magic_cards");
var _user_registration = require("./user_registration");
var _users = require("./users");
var _users_balance_log = require("./users_balance_log");
var _users_bet = require("./users_bet");
var _users_energy = require("./users_energy");
var _users_magic_card_totals = require("./users_magic_card_totals");
var _users_magic_cards = require("./users_magic_cards");
var _users_wallet = require("./users_wallet");
var _website_config = require("./website_config");

function initModels(sequelize) {
  var bot_info = _bot_info(sequelize, DataTypes);
  var game_results = _game_results(sequelize, DataTypes);
  var magic_cards = _magic_cards(sequelize, DataTypes);
  var user_registration = _user_registration(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var users_balance_log = _users_balance_log(sequelize, DataTypes);
  var users_bet = _users_bet(sequelize, DataTypes);
  var users_energy = _users_energy(sequelize, DataTypes);
  var users_magic_card_totals = _users_magic_card_totals(sequelize, DataTypes);
  var users_magic_cards = _users_magic_cards(sequelize, DataTypes);
  var users_wallet = _users_wallet(sequelize, DataTypes);
  var website_config = _website_config(sequelize, DataTypes);

  users_magic_cards.belongsTo(magic_cards, { as: "card", foreignKey: "cardId"});
  magic_cards.hasMany(users_magic_cards, { as: "users_magic_cards", foreignKey: "cardId"});
  users_energy.belongsTo(users, { as: "row", foreignKey: "rowId"});
  users.hasOne(users_energy, { as: "users_energy", foreignKey: "rowId"});
  users_magic_card_totals.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(users_magic_card_totals, { as: "users_magic_card_totals", foreignKey: "userId"});
  users_wallet.belongsTo(users, { as: "row", foreignKey: "rowId"});
  users.hasOne(users_wallet, { as: "users_wallet", foreignKey: "rowId"});
  users_bet.belongsTo(users_wallet, { as: "userRow", foreignKey: "userRowId"});
  users_wallet.hasMany(users_bet, { as: "users_bets", foreignKey: "userRowId"});

  return {
    bot_info,
    game_results,
    magic_cards,
    user_registration,
    users,
    users_balance_log,
    users_bet,
    users_energy,
    users_magic_card_totals,
    users_magic_cards,
    users_wallet,
    website_config,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
