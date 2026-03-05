const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.selector');

const Game = sequelize.define('Game', {
  name: { type: DataTypes.STRING, allowNull: false },
  rules: { type: DataTypes.TEXT, allowNull: true },
  gameStatus: { // Coluna nova para fugir do erro
    type: DataTypes.STRING, 
    allowNull: false,
    defaultValue: 'waiting'
  },
  currentTurnId: { type: DataTypes.INTEGER, allowNull: true },
  maxPlayers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
  creatorId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Game;