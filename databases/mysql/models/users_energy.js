const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_energy', {
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
    currentEnergy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "当前能量值，表示用户当前的能量槽中的能量量"
    },
    energyCapacity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "能量槽容量，表示能量槽的最大容纳量"
    },
    lastUpdateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
      comment: "最后更新时间，用来计算从上次更新到现在能量应该增加的量"
    },
    energyAccumulationRate: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "能量积攒速度，表示每秒增加的能量值，默认为1"
    },
    dailyLimitTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "溢出時間"
    }
  }, {
    sequelize,
    tableName: 'users_energy',
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
