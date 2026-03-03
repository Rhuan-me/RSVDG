class UpdateScoringHistoryRequestDTO {
    constructor({ playerId, gameId, score } = {}) {
        this.playerId = playerId;
        this.gameId = gameId;
        this.score = score;
    }

    validate() {
        const errors = [];

        const hasAtLeastOneField =
            this.playerId !== undefined ||
            this.gameId !== undefined ||
            this.score !== undefined;

        if (!hasAtLeastOneField) {
            errors.push('At least one field must be provided');
        }

        if (this.playerId !== undefined) {
            if (!Number.isInteger(this.playerId)) {
                errors.push('playerId must be an integer');
            }
        }

        if (this.gameId !== undefined) {
            if (!Number.isInteger(this.gameId)) {
                errors.push('gameId must be an integer');
            }
        }

        if (this.score !== undefined) {
            if (!Number.isInteger(this.score)) {
                errors.push('score must be an integer');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
}

module.exports = UpdateScoringHistoryRequestDTO;