const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

// --- ROTAS DO LOBBY (Resolve os erros das imagens 9353f7 e 9285a7) ---
router.post('/', gameController.create); // Atende POST /api/games
router.post('/create', gameController.create);
router.post('/players', gameController.getPlayers); // Atende POST /api/games/players
router.get('/players/:id', gameController.getPlayers); // Atende GET /api/games/players/:id
router.get('/:id', gameController.getById);

// --- ROTAS DE AÇÃO ---
router.post('/join', gameController.join);
router.post('/ready', gameController.toggleReady);
router.post('/start', gameController.start);

// --- ROTAS DA SALA DE JOGO (Resolve os erros da imagem 93c517) ---
router.post('/state', gameController.getState);
router.post('/current-player', gameController.getState);
router.post('/my-hand', gameController.getMyHand); // Atende POST /api/games/my-hand
router.post('/top-card', gameController.getTopCard);
router.post('/play-card', gameController.playCard);
router.post('/draw-card', gameController.drawCard);

/**
 * @route POST /api/games/deal-cards
 * @description Distribuir cartas aos jogadores usando recursão
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {number} [cardsPerPlayer=7] - Número de cartas por jogador (padrão: 7)
 * @returns {Object} 200 - Cartas distribuídas com sucesso
 * @example
 * Request body:
 * {
 *   "game_id": 1,
 *   "cardsPerPlayer": 7
 * }
 * Response:
 * {
 *   "message": "Cards dealt successfully.",
 *   "players": {
 *     "Player1": ["Red 3", "Blue Skip", "Green 7", ...],
 *     "Player2": ["Yellow Reverse", "Red 5", "Blue Draw Two", ...]
 *   }
 * }
 */
router.post('/deal-cards', auth, gameController.dealCards);

/**
 * @route PUT /api/games/play-card
 * @description Jogar uma carta seguindo as regras do UNO
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {string} player - Nome do jogador
 * @body {string} cardPlayed - Carta a ser jogada
 * @body {string} [chosenColor] - Cor escolhida (obrigatório para cartas Wild: "Red", "Blue", "Green", "Yellow")
 * @returns {Object} 200 - Carta jogada com sucesso
 * @returns {Object} 400 - Carta inválida
 * @example
 * Request body:
 * {
 *   "game_id": 1,
 *   "player": "Player1",
 *   "cardPlayed": "Green 7"
 * }
 * Response (200 OK):
 * {
 *   "message": "Card played successfully.",
 *   "cardPlayed": "Green 7",
 *   "nextPlayer": "Player2",
 *   "remainingCards": 6
 * }
 * Response (400 Bad Request):
 * {
 *   "message": "Invalid card. Please play a card that matches the top card on the discard pile."
 * }
 */
router.put('/play-card', auth, gameController.playCard);

/**
 * @route POST /api/games/valid-cards
 * @description Obter cartas válidas que um jogador pode jogar (usando recursão/generator)
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {string} player - Nome do jogador
 * @returns {Object} 200 - Lista de cartas válidas
 * @example
 * Request body:
 * {
 *   "game_id": 1,
 *   "player": "Player1"
 * }
 * Response:
 * {
 *   "player": "Player1",
 *   "topCard": "Red 7",
 *   "currentColor": null,
 *   "validCards": ["Red 3", "Red Skip", "Green 7", "Wild"],
 *   "totalValidCards": 4
 * }
 */
router.post('/valid-cards', auth, gameController.getValidCards);

/**
 * @route PUT /api/games/draw-card
 * @description Comprar uma carta do baralho quando não pode jogar
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {string} player - Nome do jogador
 * @returns {Object} 200 - Carta comprada com sucesso
 * @example
 * Request body:
 * {
 *   "game_id": 1,
 *   "player": "Player1"
 * }
 * Response:
 * {
 *   "message": "Player1 drew a card from the deck.",
 *   "cardDrawn": "Green Reverse",
 *   "nextPlayer": "Player2"
 * }
 */
router.put('/draw-card', auth, gameController.drawCard);

/**
 * @route PATCH /api/games/say-uno
 * @description Jogador diz "UNO" quando tem 1 carta restante
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {string} player - Nome do jogador
 * @body {string} action - Deve ser "Say UNO"
 * @returns {Object} 200 - UNO dito com sucesso
 * @example
 * Request body:
 * {
 *   "game_id": 1,
 *   "player": "Player1",
 *   "action": "Say UNO"
 * }
 * Response:
 * {
 *   "message": "Player1 said UNO successfully."
 * }
 */
router.patch('/say-uno', auth, gameController.sayUno);

/**
 * @route POST /api/games/challenge-uno
 * @description Desafiar um jogador que não disse "UNO"
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {string} challenger - Nome do desafiante
 * @body {string} challengedPlayer - Nome do jogador desafiado
 * @returns {Object} 200 - Desafio bem-sucedido / 400 - Desafio falhou
 * @example
 * Request body:
 * {
 *   "game_id": 1,
 *   "challenger": "Player2",
 *   "challengedPlayer": "Player1"
 * }
 * Response (200 OK):
 * {
 *   "message": "Challenge successful. Player1 forgot to say UNO and draws 2 cards."
 * }
 * Response (400 Bad Request):
 * {
 *   "message": "Challenge failed. Player1 said UNO on time."
 * }
 */
router.post('/challenge-uno', auth, gameController.challengeUno);

/**
 * @route PUT /api/games/turn
 * @description Ação unificada de turno (jogar carta ou comprar carta). O turno termina automaticamente.
 * @access Private (Requer Token)
 * @body {number} game_id - ID do jogo
 * @body {string} player - Nome do jogador
 * @body {string} action - "play-card" ou "draw-card"
 * @body {string} [card] - Carta a jogar (obrigatório se action = "play-card")
 * @body {string} [chosenColor] - Cor escolhida (obrigatório para Wild: "Red", "Blue", "Green", "Yellow")
 * @returns {Object} 200 - Turno executado com sucesso
 * @example
 * Request body (jogar carta):
 * {
 *   "game_id": 1,
 *   "player": "Player1",
 *   "action": "play-card",
 *   "card": "Blue 5"
 * }
 * Response:
 * {
 *   "message": "Player1 played Blue 5. Turn ended."
 * }
 * 
 * Request body (comprar carta):
 * {
 *   "game_id": 1,
 *   "player": "Player2",
 *   "action": "draw-card"
 * }
 * Response:
 * {
 *   "message": "Player2 drew a card. Turn ended."
 * }
 */
router.put('/turn', auth, gameController.executeTurn);

module.exports = router;
