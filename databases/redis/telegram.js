
const telegram = {
    watchInputKey: "watchInput#",
    getWatchInputKey(bot_id, chat_id, message_id) {
        return `${this.watchInput}${bot_id}#${chat_id}#${message_id}`
    },
    async watchInput(bot_id, chat_id, message_id, action) {
        const key = await this.getWatchInputKey(bot_id, chat_id, message_id);
        await this.set(key, action, 'EX', '3600');
    },
    async isWatchMessage(bot_id, chat_id, message_id) {
        const key = await this.getWatchInputKey(bot_id, chat_id, message_id);
        return await this.get(key);
    }
}

module.exports = telegram;