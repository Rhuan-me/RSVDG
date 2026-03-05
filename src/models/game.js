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
<<<<<<< HEAD
  currentTurnId: { type: DataTypes.INTEGER, allowNull: true },
  maxPlayers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
  creatorId: { type: DataTypes.INTEGER, allowNull: false }
=======
  /**
   * Regras do jogo
   * @type {string}
   */
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  /**
   * Status atual do jogo
   * @type {string}
   * @default 'waiting'
   */
  status: {
    type: DataTypes.ENUM('active', 'waiting', 'started', 'finished'),
    allowNull: false,
    defaultValue: 'waiting',
    validate: {
      isIn: {
        args: [['active', 'waiting', 'started', 'finished']],
        msg: 'Status deve ser: active, waiting, started ou finished'
      }
    }
  },
  /**
   * Número máximo de jogadores
   * @type {number}
   * @default 4
   */
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      isInt: {
        msg: 'maxPlayers deve ser um número inteiro'
      },
      min: {
        args: [2],
        msg: 'O número mínimo de jogadores é 2'
      },
      max: {
        args: [10],
        msg: 'O número máximo de jogadores é 10'
      }
    }
  },
  /**
   * ID do criador do jogo para controle de permissão ao iniciar
   * @type {number}
   */
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: "O ID do criador deve ser um número inteiro." },
      notNull: { msg: "O ID do criador é obrigatório." }
    }
  },
  /**
   * Pilha de descarte - armazena as cartas jogadas
   * @type {Array}
   */
  discardPile: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false,
    comment: "Armazena as cartas na pilha de descarte"
  },
  /**
   * Cor atual do jogo (importante para cartas)
   * @type {string}
   */
  currentColor: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Cor atual após cartas Wild serem jogadas"
  },
  /**
   * Baralho restante (cartas não distribuídas)
   * @type {Array}
   */
  deck: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false,
    comment: "Armazena as cartas restantes no baralho para compra"
  },
  /**
   * Direção do jogo (1 = horário, -1 = anti-horário)
   * @type {number}
   */
  direction: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    comment: "1 = horário, -1 = anti-horário"
  },
  /**
   * Índice do jogador atual na ordem do jogo
   * @type {number}
   */
  currentPlayerIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: "Índice do jogador atual na lista ordenada de jogadores"
  },
  /**
   * Quantidade de cartas a serem compradas pelo próximo jogador (Draw Two /  Draw Four)
   * @type {number}
   */
  drawPenalty: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: "Cartas pendentes de compra acumuladas"
  }
>>>>>>> 4c219041726893b2786909d1ad4814fad16f6f71
});

module.exports = Game;
