class CreateGamePlayerRequestDTO {
    constructor({ gameId, playerId, isReady, isCurrentTurn, score } = {}) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.isReady = isReady;
        this.isCurrentTurn = isCurrentTurn;
        this.score = score;
    }

    validate() {
        const errors = [];

        if (typeof this.gameId !== 'number' || !Number.isInteger(this.gameId)) {
            errors.push('gameId must be an integer');
        }

        if (typeof this.playerId !== 'number' || !Number.isInteger(this.playerId)) {
            errors.push('playerId must be an integer');
        }

        if (this.isReady !== undefined) {
            if (typeof this.isReady !== 'boolean') {
                errors.push('isReady must be a boolean');
            }
        }

        if (this.isCurrentTurn !== undefined) {
            if (typeof this.isCurrentTurn !== 'boolean') {
                errors.push('isCurrentTurn must be a boolean');
            }
        }

        if (this.score !== undefined) {
            if (typeof this.score !== 'number' || !Number.isInteger(this.score)) {
                errors.push('score must be an integer');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
}

module.exports = CreateGamePlayerRequestDTO;