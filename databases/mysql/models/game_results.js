const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('game_results', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    state: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "0未使用，1已使用"
    },
    round: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "回合"
    },
    encryption: {
      type: DataTypes.CHAR(64),
      allowNull: false,
      defaultValue: "",
      comment: "加密结果"
    },
    multiplier: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 1.0,
      comment: "倍数"
    }
  }, {
    sequelize,
    tableName: 'game_results',
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
    ]
  });
};
