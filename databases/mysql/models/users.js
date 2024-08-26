const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    rowId: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: "",
      unique: "user_id"
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    languageCode: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    userParent: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userAvatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    hasTrigger: true,
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
        name: "user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
        ]
      },
    ]
  });
};
