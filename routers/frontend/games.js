const db = require('../../databases/mysql');
const Joi = require('joi')
const Boom = require('@hapi/boom');
const redis = require('../../databases/redis');
const emit = require('../../libary/socketEmit');
const gameLibary = require('../../libary/game');
const routerPrefix = "games";
const routerSuffix = ".php"

const routers = [
    {
        method: ['POST'],
        path: '/info',
        handler: async (request, h) => {
            const gameInfo = await redis.getGameInfo();
            return {
                statusCode: 200,
                data: gameInfo
            }
        },
        options: {
            auth: false,
            tags: [routerPrefix, "info"],
            description: "get game info",
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
    },
    {
        method: ['POST'],
        path: '/result',
        handler: async (request, h) => {
            const data = await db.game_results.findAndCountAll({
                attributes: [
                    'id',
                    'round',
                    'encryption',
                    'updatedAt'
                ],
                where: {
                    state: 1,
                },
                limit: request.payload.limit,
                offset: (request.payload.page - 1) * request.payload.limit,
                order: [['id', 'asc']]
            });
            return {
                statusCode: 200,
                data
            }
        },
        options: {
            auth: false,
            tags: [routerPrefix, "result"],
            description: "get game result",
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
    },
    {
        method: ['POST'],
        path: '/bet',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const gameInfo = await redis.getGameInfo();
            if (!gameInfo) {
                return Boom.badGateway(request.i18n.t("system error"));
            }
            if (gameInfo.round != request.payload.round) {
                return Boom.preconditionRequired(request.i18n.t("Game rounds do not match"));
            }
            if (gameInfo.status != 1) {
                return Boom.preconditionRequired(request.i18n.t("No betting is allowed while the game is in progress"));
            }

            const transaction = await db.client.sequelize.transaction();
            let newBalance = 0;
            try {
                const countBetTimes = await db.users_bet.count({
                    where: {
                        round: gameInfo.round,
                        userRowId: userId
                    },
                    transaction
                });
                if (countBetTimes >= 2) {
                    throw new Error(request.i18n.t("Only 2 orders are allowed per round"));
                }
                if (request.payload.coinType == 1) {
                    newBalance = await db.users_energy.updateEnergy(userId, request.payload.amount, transaction);
                } else {
                    await db.users_wallet.decrementBalance(userId, request.payload.amount, 'bet', gameInfo.round, transaction);
                }
                const userWallet = await db.users_wallet.findOne({
                    attributes: [
                        'userBonus',
                        'winMultiplier'
                    ],
                    where: {
                        rowId: userId
                    }
                });
                const result = await db.users_bet.create({
                    round: gameInfo.round,
                    betTime: new Date(),
                    multiplier: request.payload.auto ? request.payload.multiplier : 0,
                    winMultiplier: userWallet.winMultiplier,
                    isAuto: request.payload.auto,
                    userRowId: userId,
                    amount: request.payload.amount,
                    coinType: request.payload.coinType,
                }, { transaction });
                await transaction.commit();
                const response = {
                    statusCode: 200,
                    data: {
                        recordId: result.id,
                        newBalance
                    }
                }
                try {
                    if (request.payload.coinType != 1) {
                        response.data.newBalance = userWallet.userBonus;
                    }
                    await emit.changeBalance(userId, request.payload.coinType);
                } catch (error) {
                    console.error(error);
                }
                return response;
            } catch (error) {
                await transaction.rollback();
                return Boom.expectationFailed(error.message);
            }
        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "bet"],
            description: "bet",
            validate: {
                payload: Joi.object({
                    round: Joi.number().min(2404110001).max(3401010001).required(),
                    coinType: Joi.number().min(1).max(2).default(1).required()/** 1锁定积分，2解锁积分 */,
                    auto: Joi.number().min(0).max(1).default(1).optional(),/** 0手动cashout，1自动cashout */
                    multiplier: Joi.number().when('auth', {
                        is: 0,
                        then: Joi.valid(0),
                        otherwise: Joi.number().min(1.01).max(1e6)
                    }),
                    amount: Joi.number().min(50).max(150).default(50).required(),
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
    },
    {
        method: ['POST'],
        path: '/cashout',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const recordInfo = await db.users_bet.findOne({
                attributes: [
                    "id",
                    "round",
                ],
                where: {
                    id: request.payload.recordId,
                    isAuto: 0,
                    userRowId: userId,
                }
            })
            if (!recordInfo) {
                return Boom.preconditionRequired(request.i18n.t("Record not found"));
            }
            const gameInfo = await redis.getGameInfo();
            if (!gameInfo) {
                return Boom.badGateway(request.i18n.t("system error"));
            }
            if (gameInfo.round != recordInfo.round) {
                return Boom.preconditionRequired(request.i18n.t("Game rounds do not match"));
            }
            if (gameInfo.status != 2) {
                return Boom.preconditionRequired(request.i18n.t("Cashout are not allowed when the game is not in progress"));
            }

            const multiplier = gameLibary.calculateOdds(new Date().getTime() - Number(gameInfo.startTime));
            recordInfo.multiplier = multiplier;
            recordInfo.isAuto = 1;
            await recordInfo.save();
            return {
                statusCode: 200,
                data: {
                    multiplier
                }
            }

        },
        options: {
            auth: 'jwt',
            tags: [routerPrefix, "cashout"],
            description: "cashout",
            validate: {
                payload: Joi.object({
                    recordId: Joi.number().min(1).required(),
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
    },
    {
        method: ['POST'],
        path: '/history',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const where = {
                userRowId: userId,
            }
            if (request.payload.isWin > -1) {
                where.isWin = request.payload.isWin;
            }
            const data = await db.users_bet.findAndCountAll({
                attributes: [
                    'round',
                    'multiplier',
                    'result',
                    'coinType',
                    'isWin',
                    'amount',
                    'state',
                    'createdAt',
                    "updatedAt"
                ],
                where,
                limit: request.payload.limit,
                offset: (request.payload.page - 1) * request.payload.limit,
                order: [['id', 'desc']]
            });
            return {
                statusCode: 200,
                data
            }
        },
        options: {
            auth: 'jwt',
            tags: [routerPrefix, "history"],
            description: "user bet history",
            validate: {
                payload: Joi.object({
                    isWin: Joi.number().min(-1).max(1).default(-1).optional(),
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
    },
]


module.exports = {
    routers,
    routerPrefix,
    routerSuffix
};