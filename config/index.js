const env = require('./env');
const server = require('./server');
const mysql = require('./mysql');
const i18n=require('./i18n');


module.exports = {
    ...env,
    env,
    mysql,
    server,
    i18n
}
