const bot = require('../../libary/bot');
const db = require('../../databases/mysql');
const config = require('../../config');
const { logger } = require('../../libary/logs2');
const logs = new logger({
    service: "telegram_watch"
});


const routers = {
    name: {
        handler: async function (msg) {
           
        }
    },
}


module.exports = routers;