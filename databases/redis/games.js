
const mail = {
    gameInfoKey: "gameInfo",
    async setGameInfo(info) {
        await this.hmset(this.gameInfoKey, info);
        await Promise.all([
            this.expire(this.gameInfoKey, 60),
            this.publish(this.gameInfoKey + info.status, JSON.stringify(info))
        ])
        return true;
    },
    async getGameInfo() {
        return await this.hgetall(this.gameInfoKey);
    }
}

module.exports = mail;