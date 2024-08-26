const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_magic_card_totals', {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'rowId'
      }
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    totalExpirationTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    totalPoolSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'users_magic_card_totals',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
          { name: "type" },
        ]
      },
    ]
  });
};
