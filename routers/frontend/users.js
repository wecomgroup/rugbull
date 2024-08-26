const db = require('../../databases/mysql');
const bot = require('../../libary/bot');
const Joi = require('joi')
const Boom = require('@hapi/boom');
const redis = require('../../databases/redis');
const emit = require('../../libary/socketEmit');
const routerPrefix = "users";
const routerSuffix = ".php"

const routers = [
    {
        method: ['POST'],
        path: '/init',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const userInfo = await db.users.initUserInfo(userId);
            if (!userInfo) {
                await Promise.all([
                    redis.userLoginOut(userId),
                    emit.userLoginOut(userId)
                ]);
                return Boom.unauthorized();
            }
            const betList = await db.users_bet.getUserProcessGame(userId);
            userInfo.users_bet = betList;
            return {
                statusCode: 200,
                data: userInfo
            };
        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "init"],
            description: "user init request data",
            plugins: {
                encode: function (data) {
                    const response = new indexPb.indexResponse();
                    response.setTotalOutput(data.total_output);
                    return response.serializeBinary();
                },
                decode: function (payload) {
                    if (payload) {
                        return indexPb.indexRequest.deserializeBinary(payload).toObject();
                    } else {
                        return payload;
                    }
                }
            },
        },
    },
    {
        method: ['POST'],
        path: '/balance-changes',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const data = await db.users_balance_log.findAndCountAll({
                attributes: [
                    'id',
                    ["userBonusBefore", 'before'],
                    ["userBonusAfter", 'after'],
                    ["logType", 'type'],
                    "createdAt",
                ],
                where: {
                    userRowId: userId,
                },
                limit: request.payload.limit,
                offset: (request.payload.page - 1) * request.payload.limit,
                order: [['id', 'desc']],
                raw: true
            });
            return {
                statusCode: 200,
                data
            }
        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "balance-changes"],
            description: "user balance changes",
            validate: {
                payload: Joi.object({
                    page: Joi.number().min(1).max(1e6).default(1).optional(),
                    limit: Joi.number().min(1).max(100).default(50).optional(),
                }),
            },
            plugins: {
                encode: function (data) {
                    const response = new indexPb.indexResponse();
                    response.setTotalOutput(data.total_output);
                    return response.serializeBinary();
                },
                decode: function (payload) {
                    if (payload) {
                        return indexPb.indexRequest.deserializeBinary(payload).toObject();
                    } else {
                        return payload;
                    }
                }
            }
        },
    }
]


module.exports = {
    routers,
    routerPrefix,
    routerSuffix
};