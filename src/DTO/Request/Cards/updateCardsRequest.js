class UpdateCardsRequest {
    constructor({ color, action, gameId } = {}) {
        this.color = color;
        this.action = action;
        this.gameId = gameId;
    }

    validate() {
        const errors = [];

        const hasAtLeastOne =
            this.color !== undefined ||
            this.action !== undefined ||
            this.gameId !== undefined;

        if (!hasAtLeastOne) {
            errors.push('at least one field must be provided');
        }

        if (this.color !== undefined) {
            if (typeof this.color !== 'string' || this.color.trim() === '') {
                errors.push('color must be a non-empty string');
            }
        }

        if (this.action !== undefined) {
            if (typeof this.action !== 'string' || this.action.trim() === '') {
                errors.push('action must be a non-empty string');
            }
        }

        if (this.gameId !== undefined) {
            if (typeof this.gameId !== 'number' || !Number.isInteger(this.gameId)) {
                errors.push('gameId must be an integer');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
}

module.exports = UpdateCardsRequest;