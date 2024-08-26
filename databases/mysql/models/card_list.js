const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('card_list', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    cardType: {
      type: DataTypes.CHAR(12),
      allowNull: true,
      comment: "道具類型"
    },
    cardPrice: {
      type: DataTypes.DECIMAL(14,4),
      allowNull: true,
      comment: "卡片價格"
    },
    cardValue: {
      type: DataTypes.DECIMAL(14,4),
      allowNull: false,
      defaultValue: 0.0000,
      comment: "卡片效果"
    },
    cardState: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      comment: "卡片狀態"
    },
    isLimited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "道具是否限購（0: 不限購, 1: 限購）"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "道具卡描述"
    },
    category: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "道具卡類別"
    },
    expiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "有效期"
    },
    usageLimit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "使用限制"
    }
  }, {
    sequelize,
    tableName: 'card_list',
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
        name: "cardType",
        using: "BTREE",
        fields: [
          { name: "cardType" },
        ]
      },
      {
        name: "cardState",
        using: "BTREE",
        fields: [
          { name: "cardState" },
        ]
      },
      {
        name: "isLimited",
        using: "BTREE",
        fields: [
          { name: "isLimited" },
        ]
      },
    ]
  });
};
