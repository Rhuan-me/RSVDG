const { Card, Game, GamePlayer, Player } = require('../models');

/**
 * Mapeia o jogo para o formato que o frontend espera.
 */
const mapGameForFrontend = (game) => {
    if (!game) return null;
    const gameData = game.get ? game.get({ plain: true }) : game;

    // Usa o alias 'GamePlayers' que definimos no include
    const playersList = (gameData.GamePlayers || []).map(gp => ({
        id: gp.playerId,
        username: gp.Player ? gp.Player.username : 'Desconhecido',
        isReady: gp.isReady
    }));

    return {
        ...gameData,
        status: gameData.gameStatus,
        gameStatus: gameData.gameStatus,
        players: playersList,
        GamePlayers: playersList,
        // Garante que cards também seja acessível
        cards: gameData.cards || []
    };
};

// --- FUNÇÕES DE CRIAÇÃO E LOBBY ---

exports.createGame = async (data, creatorId) => {
    const game = await Game.create({
        gameStatus: 'waiting',
        name: data.name || "Nova Partida",
        creatorId: creatorId 
    });
    await GamePlayer.create({ gameId: game.id, playerId: creatorId, isReady: true });
    return await exports.getGameState(game.id);
};

exports.joinGame = async (gameId, playerId) => {
    return await GamePlayer.findOrCreate({
        where: { gameId, playerId },
        defaults: { isReady: false }
    });
};

exports.toggleReady = async (gameId, playerId) => {
    const gp = await GamePlayer.findOne({ where: { gameId, playerId } });
    if (!gp) throw new Error("Jogador não encontrado");
    
    gp.isReady = !gp.isReady;
    await gp.save();
    
    return { success: true, isReady: gp.isReady, playerId };
};

exports.getGameState = async (gameId) => {
    const game = await Game.findByPk(gameId, {
        include: [
            { 
                model: GamePlayer, 
                as: 'GamePlayers', // USANDO O ALIAS OBRIGATÓRIO
                include: [{ model: Player, as: 'Player', attributes: ['username'] }] 
            },
            { 
                model: Card, 
                as: 'cards' // USANDO O ALIAS OBRIGATÓRIO
            }
        ]
    });
    return mapGameForFrontend(game);
};

exports.getGamePlayers = async (gameId) => {
    const gps = await GamePlayer.findAll({
        where: { gameId },
        include: [{ model: Player, as: 'Player', attributes: ['username'] }]
    });
    return gps.map(gp => ({
        id: gp.playerId,
        username: gp.Player ? gp.Player.username : 'Desconhecido',
        isReady: gp.isReady
    }));
};

// --- LÓGICA DE INÍCIO DE JOGO (START) ---

exports.startGame = async (gameId) => {
    const players = await GamePlayer.findAll({ where: { gameId } });
    
    if (players.length < 2) {
        throw new Error("Mínimo de 2 jogadores para iniciar a partida!");
    }

    const firstPlayerId = players[0].playerId;

    await Game.update({ 
        gameStatus: 'active', 
        currentTurnId: firstPlayerId 
    }, { where: { id: gameId } });

    const colors = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (const player of players) {
        for (let i = 0; i < 7; i++) {
            await Card.create({
                gameId,
                playerId: player.playerId,
                color: colors[Math.floor(Math.random() * colors.length)],
                value: values[Math.floor(Math.random() * values.length)],
                cardStatus: 'in_hand'
            });
        }
    }

    await Card.create({
        gameId,
        color: colors[Math.floor(Math.random() * colors.length)],
        value: values[Math.floor(Math.random() * values.length)],
        cardStatus: 'discarded'
    });

    return { 
        success: true, 
        gameStatus: 'active',
        status: 'active'
    };
};

// --- RESTANTE DAS FUNÇÕES (PLAY, DRAW, HAND) ---

exports.getPlayerHand = async (gameId, playerId) => {
    const cards = await Card.findAll({ 
        where: { gameId, playerId, cardStatus: 'in_hand' } 
    });
    return { hand: cards, cards: cards };
};

exports.getTopCard = async (gameId) => {
    return await Card.findOne({ 
        where: { gameId, cardStatus: 'discarded' }, 
        order: [['updatedAt', 'DESC']] 
    });
};

exports.playCard = async (gameId, playerId, cardId) => {
    const game = await Game.findByPk(gameId);
    const card = await Card.findByPk(cardId);

    if (!card || card.playerId !== playerId) throw new Error("Esta carta não é sua.");
    if (game.currentTurnId !== playerId) throw new Error("Não é seu turno.");

    card.cardStatus = 'discarded';
    card.playerId = null;
    await card.save();

    const players = await GamePlayer.findAll({ where: { gameId }, order: [['id', 'ASC']] });
    const currentIndex = players.findIndex(p => p.playerId === playerId);
    const nextIndex = (currentIndex + 1) % players.length;
    
    game.currentTurnId = players[nextIndex].playerId;
    await game.save();

    return { success: true, nextTurn: game.currentTurnId };
};

exports.drawCard = async (gameId, playerId) => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return await Card.create({
        gameId,
        playerId,
        color: colors[Math.floor(Math.random() * colors.length)],
        value: values[Math.floor(Math.random() * values.length)],
        cardStatus: 'in_hand'
    });
};