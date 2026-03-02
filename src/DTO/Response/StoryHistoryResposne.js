class ScoringHistoryResponseDTO {
    constructor(scoringHistory) {
        this.playerId = scoringHistory.playerId;
        this.gameId = scoringHistory.gameId;
        this.score = scoringHistory.score;
    }
}

module.exports = ScoringHistoryResponseDTO;