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

module.exports = router;