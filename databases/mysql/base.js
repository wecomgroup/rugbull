const client = require('../../libary/mysql');
const init = require('./models/init-models');


const db = init.initModels(client.sequelize);

db.result = (arr) => {
    let result = JSON.parse(`[${JSON.stringify(arr).replace(/\[|\]/g, '')}]`);
    return result.find(item => item);
}

db.client = client;

module.exports = db;