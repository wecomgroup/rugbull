const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_wallet', {
    rowId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'rowId'
      }
    },
    userBonus: {
      type: DataTypes.DECIMAL(26,8),
      allowNull: true,
      defaultValue: 0.00000000
    },
    lastUpdateType: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    lastUpdateRemark: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    winMultiplier: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 1,
      comment: "1普通, 2双赢"
    }
  }, {
    sequelize,
    tableName: 'users_wallet',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rowId" },
        ]
      },
    ]
  });
};
