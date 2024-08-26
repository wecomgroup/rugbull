// user login

const users = {
    userLoginKeyName(userId) {
        return `usersLoginInfo#${userId}`
    },

    async userLogin(userId, loginId) {
        this.hmset(this.userLoginKeyName(userId), {
            loginId
        });
        this.expireat(this.userLoginKeyName(userId), Math.floor(new Date().getTime() / 1000) + 2592000);
        return true;
    },

    async setUserSocketId(userId, socketId) {
        await this.hmset(this.userLoginKeyName(userId), {
            socketId
        });
        return true;
    },

    async getUserSocketId(userId) {
        return await this.hget(this.userLoginKeyName(userId), 'socketId');
    },

    async getUserLoginInfo(userId) {
        return this.hgetall(this.userLoginKeyName(userId));
    },

    async hasLogin(userId, loginId) {
        const info = await this.getUserLoginInfo(userId);
        return info ? info.loginId == loginId : false;
    },

    async userLoginOut(userId) {
        return await this.del(this.userLoginKeyName(userId));
    },
    getPraentInfoKey(parentId) {
        return `parentInfo#${parentId}`;
    },
    async getParentInfo(parentId) {
        let parentInfo = await this.hgetall(this.getPraentInfoKey(parentId));
        if (Object.keys(parentInfo).length < 1) {
            const userInfo = await db.users.findOne({
                where: {
                    userId: parentId
                },
                raw: true
            });
            if (userInfo) {
                await this.hmset(this.getPraentInfoKey(parentId), userInfo);
                parentInfo = userInfo;
            }
        }
        return parentInfo;
    }

}

module.exports = users;