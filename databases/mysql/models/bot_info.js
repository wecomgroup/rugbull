const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bot_info', {
    rowId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: "",
      unique: "id"
    },
    first_name: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'bot_info',
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
      {
        name: "id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "username",
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
