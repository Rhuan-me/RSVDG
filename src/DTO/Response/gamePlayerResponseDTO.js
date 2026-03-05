class GamePlayerResponseDTO {
    constructor(gamePlayer) {
        this.gameId = gamePlayer.gameId;
        this.playerId = gamePlayer.playerId;
        this.isReady = gamePlayer.isReady;
        this.isCurrentTurn = gamePlayer.isCurrentTurn;
        this.score = gamePlayer.score;
        this.hand = gamePlayer.hand;
        this.saidUno = gamePlayer.saidUno;
        this.turnOrder = gamePlayer.turnOrder;
    }
}

module.exports = GamePlayerResponseDTO;