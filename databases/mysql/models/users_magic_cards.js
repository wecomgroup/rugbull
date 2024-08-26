const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_magic_cards', {
    rowId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'magic_cards',
        key: 'rowId'
      }
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    purchaseTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    expirationTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users_magic_cards',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rowId" },
        ]
      },
      {
        name: "userId",
        using: "BTREE",
        fields: [
          { name: "userId" },
        ]
      },
      {
        name: "cardId",
        using: "BTREE",
        fields: [
          { name: "cardId" },
        ]
      },
    ]
  });
};
