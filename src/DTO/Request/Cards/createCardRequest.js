class CreateGameRequestDTO {
    constructor({ color, action, gameId } = {}) {
        this.color = color;
        this.action = action;
        this.gameId = gameId;
    }

    validate() {
        const errors = [];

        if (!this.color || typeof this.color !== 'string') {
            errors.push('color is required');
        }

        if (!this.action || typeof this.action !== 'string') {
            errors.push('action is required');
        }

        if (typeof this.gameId !== 'number' || !Number.isInteger(this.gameId)) {
            errors.push('gameId must be an integer');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
}

module.exports = CreateGameRequestDTO;