const config = require('../config/mysql')
const logs = require('./logs2');
const sqlLog = new logs.logger({ service: "sql" });
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    config.connection.database,
    config.connection.user,
    config.connection.password,
    {
        host: config.connection.host,
        dialect: config.dialect,
        logging: (msg, model) => {
            let { where, type, attributes, originalAttributes, tableNames, instance, bind } = model;
            sqlLog.debug(msg, { where, type, attributes, originalAttributes, tableNames, instance, bind })
        },
        // logging: true,
        // timezone: '+08:00',
        // dialectOptions:{
        //     useUTC:false
        // },
        quoteIdentifiers: true,
    },
)

sequelize.query = async function () {
    // proxy this call
    // since `query` is a promise, we can just use promise functions instead of try-catch
    return Sequelize.prototype.query.apply(this, arguments).catch(function (err) {
        // handle it with sentry
        throw err;
    });
};


sequelize.authenticate().then(async res => {
    // sequelize.query('')
}).catch(error => {
    console.error(error)  
    process.exit();
})


module.exports = {
    sequelize,
    DataTypes
}
