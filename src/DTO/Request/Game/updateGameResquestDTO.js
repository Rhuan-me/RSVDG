class UpdateGameRequestDTO {
    constructor({ title, status, maxPlayers } = {}) {
        this.title = title;
        this.status = status;
        this.maxPlayers = maxPlayers;
    }

    validate() {
        const errors = [];
        const validStatuses = ['waiting', 'in_progress', 'finished', 'cancelled'];

        const hasAtLeastOne =
            this.title !== undefined ||
            this.status !== undefined ||
            this.maxPlayers !== undefined;

        if (!hasAtLeastOne) {
            errors.push('at least one field must be provided');
        }

        if (this.title !== undefined) {
            if (typeof this.title !== 'string' || this.title.trim() === '') {
                errors.push('title must be a non-empty string');
            }
        }

        if (this.status !== undefined) {
            if (typeof this.status !== 'string' || !validStatuses.includes(this.status)) {
                errors.push(`status must be one of: ${validStatuses.join(', ')}`);
            }
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

module.exports = UpdateGameRequestDTO;