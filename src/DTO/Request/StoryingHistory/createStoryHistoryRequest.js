class CreateScoringHistoryRequestDTO {
    constructor({ playerId, gameId, score } = {}) {
        this.playerId = playerId;
        this.gameId = gameId;
        this.score = score;
    }

    validate() {
        const errors = [];

        if (this.playerId === undefined || !Number.isInteger(this.playerId)) {
            errors.push('playerId must be an integer');
        }

        if (this.gameId === undefined || !Number.isInteger(this.gameId)) {
            errors.push('gameId must be an integer');
        }

        if (this.score === undefined || !Number.isInteger(this.score)) {
            errors.push('score must be an integer');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
}

module.exports = CreateScoringHistoryRequestDTO;