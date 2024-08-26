const bot = require('../../libary/bot');
const db = require('../../databases/mysql')
const { logger } = require('../../libary/logs2');
const logs = new logger({
    service: "telegram_callback"
});


const routers = {
    accept: {
        handler: async function (msg, params, query) {
            const userInfo = await db.users.findOne({
                attributes: [
                    'rowId',
                    "id",
                    'first_name',
                    'last_name'],
                where: {
                    id: params.id
                }
            });
            if (!userInfo) {
                bot.editMessageText("审批失败，记录不存在或已过期！", {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    reply_markup: {
                        inline_keyboard: [],
                    }
                });
            } else {
                await db.users.allow(params.id);
                await Promise.all([
                    bot.editMessageText(`用户编号：${userInfo.rowId} 昵称${userInfo.first_name} ${userInfo.last_name} 已被允许使用该机器人！`, {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [],
                        }
                    }),
                    bot.sendMessage(userInfo.id, msg.__("already_apply"))
                ])
            }
            return true;
        }
    },
    reject: {
        handler: async function (msg, params, query) {
            const userInfo = await db.users.findOne({
                attributes: [
                    'rowId',
                    'allow',
                    'first_name',
                    'last_name'],
                where: {
                    id: params.id,
                    allow: {
                        [db.Op.ne]: 1
                    }
                }
            });
            if (!userInfo) {
                bot.editMessageText("审批失败，记录不存在或已过期！", {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    reply_markup: {
                        inline_keyboard: [],
                    }
                });
            } else {
                await db.users.reject(params.id);
                bot.editMessageText(`第${userInfo.allow}次拒绝该用户申请，昵称${userInfo.first_name} ${userInfo.last_name}`, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    reply_markup: {
                        inline_keyboard: [],
                    }
                });
            }
            return true;
        }
    },
    forwardToGroup: {
        handler: async function (msg, params, query) {
            const where = {};
            // 取消转发
            if (params.id == -2) {
                await bot.editMessageText(msg.__('cancel'), {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    reply_markup: {
                        inline_keyboard: [],
                    }
                });
                return true;
            }
            // 转发全部
            else if (params.id == -1) {
                where.userId = params.uid;
            }
            else {
                where.id = params.gid;
                where.userId = params.uid;
            }
            const list = await db.email_list.findAll({ where }), forwardList = [];
            if (list.length > 0) {
                for (let item of list) {
                    forwardList.push({
                        email_id: item.id,
                        group_id: params.gid
                    });
                }
                await db.forward.create(forwardList);
            }
            await bot.editMessageText(msg.__('done'), {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [],
                }
            });
        }
    }
}


module.exports = routers;