const Bot = require('./telegram');
const config = require('../config');
const utils = new Bot(config.bot.token, { polling: false });

utils.isSuperAdmin = (id) => {
    return config.bot.super_admin.includes(String(id));
}

utils.sendMessageToAdmin = (msg, options) => {
    if (Array.isArray(config.bot.super_admin)) {
        for(let id of config.bot.super_admin){
            utils.sendMessage(id, msg, options);
        }
    } else {
        return utils.sendMessage(config.bot.super_admin, msg, options);
    }
    return true;
}

module.exports = utils