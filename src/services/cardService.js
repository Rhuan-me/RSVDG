const Card = require('../models/card');

const CardService = {
  initCards: async () => {
    try {
      const count = await Card.count();
      if (count > 0) return;

      const colors = ['red', 'blue', 'green', 'yellow'];
      const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
      const specials = ['wild', 'wild4'];

      const cardsToCreate = [];

      // Cartas coloridas
      for (const color of colors) {
        for (const value of values) {
          cardsToCreate.push({ color, value, status: 'deck', gameId: null });
          if (value !== '0') {
            cardsToCreate.push({ color, value, status: 'deck', gameId: null });
          }
        }
      }

      // Cartas pretas
      for (const special of specials) {
        for (let i = 0; i < 4; i++) {
          cardsToCreate.push({ color: 'black', value: special, status: 'deck', gameId: null });
        }
      }

      await Card.bulkCreate(cardsToCreate);
      console.log('✅ Baralho de UNO inicializado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao inicializar cartas:', error.message);
      throw error;
    }
  }
};

module.exports = CardService;