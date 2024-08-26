
const systems = {
    createProcessKeyPrefix: 'createProcessKey#',
    createProcessKey() {
        return `${this.createProcessKeyPrefix}${process.uuid}`
    },
    async createProcess() {
        await this.hmset(this.createProcessKey(), { sockets: 0 });
        this.expiredCreateProcess();
    },
    async expiredCreateProcess() {
        return await this.expire(this.createProcessKey(), 60);
    },
    async getCountOnlineUsers() {
        const keys = await this.keys(`rugbull#createProcessKey#*`);
        let total = 0;
        for (let item of keys) {
            const key = item.replace(this.options.keyPrefix, '');
            const processUserTotal = await this.hget(key, 'sockets');
            total += Number(processUserTotal);
        }
        return total;
    },
    async userOnline() {
        const [total] = await Promise.all([
            this.hincrby(this.createProcessKey(), 'sockets', 1),
            this.expiredCreateProcess()
        ]);
        return total;
    },
    async userOffline() {
        const [total] = await Promise.all([
            this.hincrby(this.createProcessKey(), 'sockets', -1),
            this.expiredCreateProcess()
        ]);
        return total;
    },

}

module.exports = systems;