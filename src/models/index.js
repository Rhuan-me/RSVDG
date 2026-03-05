const sequelize = require('../config/database.selector');
const Game = require('./game');
const Player = require('./player');
const Card = require('./card');
const GamePlayer = require('./gamePlayer');

// --- DEFINIÇÃO DAS ASSOCIAÇÕES ---

// Um Jogo tem muitas Cartas
Game.hasMany(Card, { foreignKey: 'gameId', as: 'cards' });
Card.belongsTo(Game, { foreignKey: 'gameId' });

// Um Jogador tem muitas Cartas (na mão)
Player.hasMany(Card, { foreignKey: 'playerId', as: 'hand' });
Card.belongsTo(Player, { foreignKey: 'playerId' });

// Relacionamento Muitos-para-Muitos (Lobby)
// Adicionamos 'as' para facilitar a busca
Game.belongsToMany(Player, { through: GamePlayer, foreignKey: 'gameId', as: 'players' });
Player.belongsToMany(Game, { through: GamePlayer, foreignKey: 'playerId' });

// Associações diretas com a tabela intermediária
// IMPORTANTE: Definir o 'as' para o Player dentro do GamePlayer
Game.hasMany(GamePlayer, { foreignKey: 'gameId', as: 'GamePlayers' });
GamePlayer.belongsTo(Game, { foreignKey: 'gameId' });

Player.hasMany(GamePlayer, { foreignKey: 'playerId' });
GamePlayer.belongsTo(Player, { foreignKey: 'playerId', as: 'Player' }); // Nome usado no Service

module.exports = {
    sequelize,
    Game,
    Player,
    Card,
    GamePlayer
};