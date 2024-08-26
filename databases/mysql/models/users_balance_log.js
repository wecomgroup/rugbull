const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_balance_log', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userRowId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    userBonusBefore: {
      type: DataTypes.DECIMAL(28,8),
      allowNull: true
    },
    userBonusAfter: {
      type: DataTypes.DECIMAL(28,8),
      allowNull: true
    },
    logType: {
      type: DataTypes.STRING(16),
      allowNull: true,
      comment: "变动类型"
    },
    logRemark: {
      type: DataTypes.STRING(16),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users_balance_log',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "userRowId",
        using: "BTREE",
        fields: [
          { name: "userRowId" },
        ]
      },
      {
        name: "logType",
        using: "BTREE",
        fields: [
          { name: "logType" },
        ]
      },
    ]
  });
};
