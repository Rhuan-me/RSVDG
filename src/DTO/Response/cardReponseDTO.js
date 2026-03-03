class CardResponseDTO {
    constructor(card) {
        this.id = card.id;
        this.color = card.color;
        this.action = card.action;
        this.gameId = card.gameId;
    }
}

module.exports = CardResponseDTO;