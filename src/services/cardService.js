const Card = require('../models/card');

<<<<<<< HEAD
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
=======
const CardRepository = require('../Repository/cardRepository');

class CardService {
  async createCard(data) {
    return await CardRepository.saveCard(data);
  }

  async getCardById(id) {
    const card = await CardRepository.findById(id);
    if (!card) throw new Error('Cartão não encontrado');
    return card;
  }

  async updateCard(id, data) {
    const card = await this.getCardById(id);
    if (!card) throw new Error('Cartão não encontrado')

    return await CardRepository.updateCard(id, data);
  }

  async deleteCard(id) {
    const card = await this.getCardById(id);
    if (!card) throw new Error('Cartão não encontrado')
    await CardRepository.deleteById(card.id);
    return { message: 'Cartão removido com sucesso' };
  }
>>>>>>> 4c219041726893b2786909d1ad4814fad16f6f71

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