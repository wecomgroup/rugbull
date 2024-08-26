const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_bet', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userRowId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'users_wallet',
        key: 'rowId'
      }
    },
    betTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    round: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    multiplier: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    amount: {
      type: DataTypes.DECIMAL(24,8),
      allowNull: true,
      defaultValue: 0.00000000
    },
    state: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "0进行中，1结算"
    },
    coinType: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "1锁定积分，2解锁积分"
    },
    isWin: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "0未结算，1赢"
    },
    checkPoint: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    isAuto: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 1
    },
    result: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    winMultiplier: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 1,
      comment: "1普通, 2双赢"
    }
  }, {
    sequelize,
    tableName: 'users_bet',
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
        name: "user_row_id",
        using: "BTREE",
        fields: [
          { name: "userRowId" },
        ]
      },
      {
        name: "checkPoint",
        using: "BTREE",
        fields: [
          { name: "checkPoint" },
        ]
      },
      {
        name: "round",
        using: "BTREE",
        fields: [
          { name: "round" },
        ]
      },
      {
        name: "state",
        using: "BTREE",
        fields: [
          { name: "state" },
        ]
      },
      {
        name: "isWin",
        using: "BTREE",
        fields: [
          { name: "isWin" },
        ]
      },
      {
        name: "isAuto",
        using: "BTREE",
        fields: [
          { name: "isAuto" },
        ]
      },
    ]
  });
};
