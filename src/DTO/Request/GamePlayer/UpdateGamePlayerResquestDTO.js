class UpdateGamePlayerRequestDTO {
    constructor({ isReady, isCurrentTurn, score } = {}) {
        this.isReady = isReady;
        this.isCurrentTurn = isCurrentTurn;
        this.score = score;
    }

    validate() {
        const errors = [];

        const hasAtLeastOne =
            this.isReady !== undefined ||
            this.isCurrentTurn !== undefined ||
            this.score !== undefined;

        if (!hasAtLeastOne) {
            errors.push('at least one field must be provided');
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

module.exports = UpdateGamePlayerRequestDTO;