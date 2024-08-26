require('dotenv').config();

module.exports = {
    DEBUG: !!process.env.DEBUG=="false",
    redis: {
        keyPrefix: process.env.REDIS_PREFIX || "",
        host: process.env.REDIS_HOST || 'localhost', // Redis服务器的主机名
        port: process.env.REDIS_PORT || 6379, // Redis服务器的端口号
        password: process.env.REDIS_PASSWORD || '', // 如果Redis服务器需要密码验证，请提供密码
        db: process.env.REDIS_DB || 0, // 要连接的数据库编号，默认为0
    },
    mysql: {
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST,
    },
    mongo: {
        host: process.env.MONGO_HOST,
        port: process.env.MONGO_PORT,
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    },
    server: {
        nts: process.env.NOTIFY_SERVER_HOST,
        port: process.env.WEB_SERVER_PORT || 3000,
        host: process.env.WEB_SERVER_HOST || '0.0.0.0'
    },
    proto: {
        enable: ["true", "TRUE", "1"].includes(process.env.ENABLE_PROTOBUF)
    },
    bot: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        super_admin: Array.isArray(process.env.TELEGRAM_SUPER_ADMIN_ID) ? process.env.TELEGRAM_SUPER_ADMIN_ID : [process.env.TELEGRAM_SUPER_ADMIN_ID],
        account: process.env.TELEGRAM_BOT_ACCOUNT
    },
    games:{
        clientSeed:process.env.GAME_CLIENTSEED,
        nonce:process.env.GAME_NONCE,
    },
    rabbitmq: {
        rabbitmq_host: process.env.RABBITMQ_HOST,
        rabbitmq_port: process.env.RABBITMQ_PORT,
        rabbitmq_user: process.env.RABBITMQ_USER,
        rabbitmq_password: process.env.RABBITMQ_PASSWORD,
        rabbitmq_vhost:process.env.RABBITMQ_VHOST || '/'
    }
}