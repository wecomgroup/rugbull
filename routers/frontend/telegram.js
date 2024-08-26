const db = require('../../databases/mysql');
const bot = require('../../libary/bot');
const Joi = require('joi')
const Boom = require('@hapi/boom');
const redis = require('../../databases/redis');
const emit = require('../../libary/socketEmit');
const qs = require('querystring');
const uuid = require("uuid");
const jwt = require('jsonwebtoken');
const config = require('../../config');
const routerPrefix = "telegram";
const routerSuffix = ".php"


const routers = [
    {
        method: ['POST'],
        path: '/login',
        handler: async (request, h) => {
            const result = bot.checkTelegramAuthData(request.payload);
            if (result) {
                const addResult = await db.users.addUser({
                    username: request.payload.username,
                    firstName: request.payload.first_name,
                    lastName: request.payload.last_name,
                    userId: request.payload.id,
                    lastLogin: new Date()
                });
                if (Array.isArray(addResult)) {
                    const userInfo = addResult[0];
                    const loginInfo = {
                        userId: userInfo.rowId,
                        loginId: uuid.v4()
                    };
                    const token = jwt.sign(loginInfo, config.server.frontend.jwtKey);
                    await redis.userLogin(loginInfo.userId, loginInfo.loginId);
                    const responseData = {
                        statusCode: 200,
                        data: {
                            token,
                            isNewUser: userInfo.isNewRecord
                        }
                    }
                    if (userInfo.isNewRecord === true) {
                        // 新用戶後續
                        const userProfile = await bot.getUserProfilePhotos(userInfo.userId);
                    }
                    return responseData;
                }
                return Boom.badGateway(request.i18n.t('server error'));
            } else {
                return Boom.unauthorized(request.i18n.t('User information verification failed'));
            }
        },
        options: {
            auth: false,
            tags: [routerPrefix, "init"],
            description: "telegram user login",
            validate: {
                payload: Joi.object({
                    id: Joi.number().max(1e16).required(),
                    first_name: Joi.string().max(32).optional(),
                    last_name: Joi.string().max(32).optional(),
                    username: Joi.string().max(32).optional(),
                    photo_url: Joi.string().uri().optional(),
                    auth_date: Joi.number().required(),
                    hash: Joi.string().required(),
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
            },
        },
    },
    {
        method: ['POST'],
        path: '/webapp-login',
        handler: async (request, h) => {
            const result = bot.verifyInitData(request.payload.initData);
            if (result) {
                const webData = JSON.parse(qs.parse(request.payload.initData).user);
                const addResult = await db.users.addUser({
                    username: webData.username,
                    firstName: webData.first_name,
                    lastName: webData.last_name,
                    userId: webData.id,
                    lastLogin: new Date()
                });
                if (Array.isArray(addResult)) {
                    const userInfo = addResult[0];
                    const loginInfo = {
                        userId: userInfo.rowId,
                        loginId: uuid.v4()
                    };
                    const token = jwt.sign(loginInfo, config.server.frontend.jwtKey);
                    await redis.userLogin(loginInfo.userId, loginInfo.loginId);
                    const responseData = {
                        statusCode: 200,
                        data: {
                            token,
                            isNewUser: userInfo.isNewRecord
                        }
                    }
                    if (userInfo.isNewRecord === true) {
                        // 新用戶後續
                        const userProfile = await bot.getUserProfilePhotos(userInfo.userId);
                    }
                    return responseData;
                }
                return Boom.badGateway(request.i18n.t('server error'));
            } else {
                return Boom.unauthorized(request.i18n.t('User information verification failed'));
            }
        },
        options: {
            auth: false,
            tags: [routerPrefix, "webapp-login"],
            description: "telegram webapp login",
            validate: {
                payload: Joi.object({
                    initData: Joi.string().max(1024).required(),
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
            },
        },
    },
]


module.exports = {
    routers,
    routerPrefix,
    routerSuffix
};