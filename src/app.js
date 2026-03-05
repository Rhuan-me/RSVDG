/**
 * @fileoverview Configuração principal da aplicação Express.
 * Define middlewares e rotas da API.
 * @module app
 */

const express = require('express');
const cors = require('cors');

// Importação dos middlewares
const requestTracking = require('./middlewares/requestTracking');

// Importação das rotas da aplicação
const signUpRoutes = require('./routes/signUpRoutes');
const loginRoutes = require('./routes/loginRoutes');
const playerRoutes = require('./routes/playerRoutes');
const cardRoutes = require('./routes/cardRoutes');
const scoringHistoryRoutes = require('./routes/scoringHistoryRoutes');
const gameRoutes = require('./routes/gameRoutes');
const requestLogRoutes = require('./routes/requestLogRoutes');

/**
 * Instância da aplicação Express.
 * @type {express.Application}
 */
const app = express();

/**
 * =========================
 * Middlewares Globais
 * =========================
 */

// Configuração de CORS aprimorada para evitar bloqueios no navegador
app.use(cors({
  origin: '*', // Permite qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // OPTIONS é vital para chamadas POST
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Permite receber JSON no body
app.use(express.json());

<<<<<<< HEAD
/**
 * =========================
 * Rotas da API
 * Prefixo padrão: /api
 * =========================
 */

// Registro de usuário
=======
// Middleware de rastreamento de requisições
// Captura métricas de todas as requisições (endpoint, método, status, tempo de resposta)
app.use(requestTracking);

// Definição de Rotas
// Rota para registro de novos usuários
>>>>>>> 4c219041726893b2786909d1ad4814fad16f6f71
app.use('/api/signup', signUpRoutes);

// Login / autenticação
app.use('/api/auth', loginRoutes);

// CRUD de jogadores
app.use('/api/players', playerRoutes);

// Cartas
app.use('/api/cards', cardRoutes);

// Histórico de pontuação
app.use('/api/scoring-history', scoringHistoryRoutes);

// Jogos (criar, entrar, iniciar, estado, etc)
app.use('/api/games', gameRoutes);
// Rota para estatísticas de requisições
app.use('/api/stats', requestLogRoutes);

/**
 * =========================
 * Middleware de Tratamento de Erros
 * =========================
 */
app.use((err, req, res, next) => {
  console.error('❌ Erro capturado no App:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Erro interno no servidor';

  res.status(status).json({ 
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

/**
 * Exporta o app
 */
module.exports = app;