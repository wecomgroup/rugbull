const db = require('../../databases/mysql');
const systemConfig = require('../../config');


async function main() {
    const config = {
        "telegramBotAccount": systemConfig.bot.account,
        "sharedCommission:1": 100,
        "clientSeed": systemConfig.games.clientSeed,
    }

    for (let configKey of Object.keys(config)) {
        await db.website_config.upsert({
            configKey,
            configValue: config[configKey],
        })
    }
}


main()