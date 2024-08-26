class CardExpirationInfo {
    constructor(userId, cardId, purchaseTime, expirationTime) {
        this.userId = userId;
        this.cardId = cardId;
        this.purchaseTime = purchaseTime;
        this.expirationTime = expirationTime;
    }
}

module.exports = CardExpirationInfo;