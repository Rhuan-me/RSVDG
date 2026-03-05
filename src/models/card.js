const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.selector');

const Card = sequelize.define('Card', {
  color: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
  cardStatus: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'deck' 
  },
  gameId: { 
    type: DataTypes.INTEGER, 
    allowNull: true // MUDANÇA AQUI: Permitir null para o initCards funcionar
  },
  playerId: { type: DataTypes.INTEGER, allowNull: true }
});

module.exports = Card;