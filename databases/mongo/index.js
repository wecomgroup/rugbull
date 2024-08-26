const client = require('../../libary/mongo');
const init = require('./models/init-models');

let db = init.initModels(client);


module.exports = {
    ...db,
    client,
};
