const db = require('../../databases/mysql');
const bot = require('../../libary/bot');
const ioredis = require('../../databases/redis');
const config = require('../../config')


async function checkUserIsAdmin(id) {
    if (bot.isSuperAdmin(id)) {
        return true
    }
    return false
}


const routers = [
    {
        path: /^\/id$/,
        description: ["获取自身TG编号", "/id"],
        handler: async function (msg) {
            this.sendMessage(msg.chat.id, this.markdown(msg.from.id), {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id
            })
        }
    },
    {
        path: /^\/start$/,
        description: ["开始", "/start"],
        handler: async function (msg) {
            await db.users.addUser({
                username: msg.from.username ?? '',
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                userId: msg.from.id
            });
            await this.sendMessage(msg.chat.id, msg.i18n.t('welcome'));
            return true;
        }
    },
    {
        path: /^\/start\ \d+$/,
        description: ["开始", "/start"],
        handler: async function (msg) {
            const parentId = String(msg.text).replace(/\D/g, '');
            const userInfo={
                username: msg.from.username ?? '',
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                userId: msg.from.id,
            };
            const parentInfo=await ioredis.getParentInfo(parentId);
            if(parentInfo && parentInfo.rowId){
                userInfo.userParent=parentInfo.rowId
            }
            await Promise.all([
                db.users.addUser(userInfo),
                this.sendMessage(msg.chat.id, msg.i18n.t('welcome'))
            ]);
            return true;
        }
    },
];


module.exports = routers;