const db = require('../../databases/mysql/base');


async function main() {
    await db.client.sequelize.sync({ alter: true });
}


main().then(process.exit);