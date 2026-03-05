const { createServer } = require('node:http');
const app = require('./app'); 
const dbConfig = require('./config/database'); 
const cardService = require('./services/cardService');
const initSocket = require('./config/socket');

const sequelize = dbConfig.sequelize || dbConfig; 
const createDatabaseIfNotExists = dbConfig.createDatabaseIfNotExists;

const Player = require('./models/player');
const Game = require('./models/game');
const GamePlayer = require('./models/gamePlayer');
const Card = require('./models/card');

// Associações
GamePlayer.belongsTo(Player, { foreignKey: 'playerId' });
GamePlayer.belongsTo(Game, { foreignKey: 'gameId' });
Player.hasMany(GamePlayer, { foreignKey: 'playerId' });
Game.hasMany(GamePlayer, { foreignKey: 'gameId' });
Game.belongsTo(Player, { as: 'CurrentPlayer', foreignKey: 'currentTurnId' });

const app_PORT = process.env.APP_PORT || 3000;

<<<<<<< HEAD
async function start() {
  try {
    // 1. Garante que o banco físico existe no MySQL
    if (typeof createDatabaseIfNotExists === 'function') {
      await createDatabaseIfNotExists();
    }

    // 2. Sincronização do Banco
    // IMPORTANTE: Mudamos para force: false para preservar seus cadastros e salas.
    // As colunas novas (gameStatus e cardStatus) já foram criadas na rodada anterior.
    await sequelize.sync({ force: false });
    console.log('✅ Conexão com o banco de dados está estável.');

    // 3. Inicialização de Cartas
    // O try/catch evita que o erro "gameId cannot be null" pare o seu servidor.
    try {
      await cardService.initCards();
      console.log('✅ Carga de cartas verificada.');
    } catch (cardError) {
      console.warn('⚠️ Nota: cardService.initCards ignorado (as cartas serão geradas no início do jogo).');
    }
    
    // 4. Início do Servidor
    app.listen(app_PORT, () => {
      console.log('----------------------------------------------------');
      console.log(`🚀 SERVIDOR ONLINE: http://localhost:${app_PORT}`);
      console.log('✅ Colunas de status corrigidas e prontas para uso.');
      console.log('----------------------------------------------------');
    });

  } catch (error) {
    console.error('❌ Erro fatal ao iniciar o servidor:', error);
  }
}

start();
=======
// Criar servidor HTTP a partir do Express
const server = createServer(app);

// Inicializar Socket.IO no servidor HTTP
const io = initSocket(server);

// Exportar io para uso em outros modulos (controllers, services, etc.)
app.set('io', io);

// Primeiro cria o banco se não existir, depois sincroniza e inicia o servidor
createDatabaseIfNotExists()
  .then(() => sequelize.sync({ alter: true })) // Use { alter: true } apenas se precisar alterar a estrutura
  .then(async () => {
    console.log('Banco de dados conectado e sincronizado.');
    
    await cardService.initCards();

    server.listen(app_PORT, () => {
      console.log(`Servidor rodando em http://localhost:${app_PORT}`);
      console.log(`WebSocket (Socket.IO) ativo na mesma porta ${app_PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });
>>>>>>> 4c219041726893b2786909d1ad4814fad16f6f71
