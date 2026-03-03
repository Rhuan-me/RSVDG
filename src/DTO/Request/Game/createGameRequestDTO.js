class CreateGameRequestDTO {
    constructor({ name, maxPlayers } = {}) {
        this.name = name;
        this.maxPlayers = maxPlayers;
    }

    validate() {
        const errors = [];

        if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
            errors.push('name is required');
        }

        if (this.maxPlayers !== undefined) {
            if (
                typeof this.maxPlayers !== 'number' ||
                !Number.isInteger(this.maxPlayers) ||
                this.maxPlayers < 2 ||
                this.maxPlayers > 10
            ) {
                errors.push('maxPlayers must be an integer between 2 and 10');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
}

module.exports = CreateGameRequestDTO;