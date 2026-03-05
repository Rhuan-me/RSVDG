const gameService = require('../services/gameService');

const getGameId = (req) => {
    return req.params.id || req.body.game_id || req.body.id || req.query.game_id;
};

exports.create = async (req, res) => {
    try {
        const game = await gameService.createGame(req.body, req.user.id);
        return res.status(201).json({ 
            ...game, 
            game_id: game.id, 
            id: game.id 
        });
    } catch (error) { 
        console.error("Erro no Create:", error);
        return res.status(400).json({ error: error.message }); 
    }
};

exports.getById = async (req, res) => {
    try {
        const id = getGameId(req);
        const game = await gameService.getGameState(id);
        if (!game) return res.status(404).json({ error: "Jogo não encontrado" });
        return res.json(game);
    } catch (error) { 
        return res.status(500).json({ error: error.message }); 
    }
};

// VERSÃO ÚNICA E CORRIGIDA DO GETSTATE
exports.getState = async (req, res) => {
    try {
        const id = getGameId(req);
        const state = await gameService.getGameState(id);
        
        if (!state) return res.status(404).json({ error: "Estado não encontrado" });

        // Blindagem: enviamos de todas as formas que o Front pode pedir
        const playersList = state.GamePlayers || state.players || [];

        return res.json({
            ...state,
            players: playersList,
            GamePlayers: playersList
        });
    } catch (error) { 
        return res.status(400).json({ error: error.message }); 
    }
};

exports.getPlayers = async (req, res) => {
    try {
        const id = getGameId(req);
        const players = await gameService.getGamePlayers(id);
        return res.json(players);
    } catch (error) { 
        return res.status(400).json({ error: error.message }); 
    }
};

exports.getMyHand = async (req, res) => {
    try {
        const id = getGameId(req);
        const result = await gameService.getPlayerHand(id, req.user.id);
        return res.json(result);
    } catch (error) { 
        return res.status(400).json({ error: error.message }); 
    }
};

exports.getTopCard = async (req, res) => {
    try {
        const id = getGameId(req);
        const card = await gameService.getTopCard(id);
        return res.json(card);
    } catch (error) { 
        return res.status(400).json({ error: error.message }); 
    }
};

exports.join = async (req, res) => {
    try { 
        const id = getGameId(req);
        await gameService.joinGame(id, req.user.id); 
        return res.json({ message: 'Joined', game_id: id }); 
    } catch (e) { return res.status(400).json({ error: e.message }); }
};

exports.toggleReady = async (req, res) => {
    try { 
        const id = getGameId(req);
        const result = await gameService.toggleReady(id, req.user.id); 
        return res.json(result); 
    } catch (e) { return res.status(400).json({ error: e.message }); }
};

exports.start = async (req, res) => {
    try { 
        const id = getGameId(req);
        await gameService.startGame(id); 
        return res.json({ message: 'Started' }); 
    } catch (e) { return res.status(400).json({ error: e.message }); }
};

exports.playCard = async (req, res) => {
    try { 
        const id = getGameId(req);
        const { card_id } = req.body;
        const result = await gameService.playCard(id, req.user.id, card_id); 
        return res.json(result); 
    } catch (e) { return res.status(400).json({ error: e.message }); }
};

exports.drawCard = async (req, res) => {
    try { 
        const id = getGameId(req);
        const card = await gameService.drawCard(id, req.user.id); 
        return res.json(card); 
    } catch (e) { return res.status(400).json({ error: e.message }); }
};