const db = require('../../databases/mysql');
// const indexPb = require('../../libary/protobuf/index_pb');
const uuid = require("uuid");
const jwt = require('jsonwebtoken');
const config = require('../../config');
const redis = require('../../databases/redis');
const Boom = require('@hapi/boom');
const { getBoomPayload } = require('../../libary/utils');
const routerPrefix = "index";
const routerSuffix = ".php"

const routers = [
    // {
    //     method: ['POST'],
    //     path: '/index',
    //     handler: async (request, h) => {
    //         const userInfo = {
    //             userId: 1,
    //             loginId: uuid.v4()
    //         };
    //         const token = jwt.sign(userInfo, config.server.frontend.jwtKey);
    //         await redis.userLogin(userInfo.userId, userInfo.loginId);
    //         return {
    //             statusCode: 200,
    //             data: {
    //                 token
    //             }
    //         };
    //     },
    //     options: {
    //         auth: false,
    //         tags: [routerPrefix, "index"],
    //         description: "get token",
    //         plugins: {
    //             encode: function (data) {
    //                 const response = new indexPb.indexResponse();
    //                 response.setTotalOutput(data.total_output);
    //                 return response.serializeBinary();
    //             },
    //             decode: function (payload) {
    //                 if (payload.proto) {
    //                     return indexPb.indexRequest.deserializeBinary(payload.proto).toObject();
    //                 } else {
    //                     return payload;
    //                 }
    //             }
    //         }
    //     },
    // },
    {
        method: ['POST'],
        path: '/webconfig',
        handler: async (request, h) => {
            const showConfig = [
                "sharedCommission:1",
                "telegramBotAccount",
                "clientSeed"
            ];
            const configData = await db.website_config.findAll({
                where: {
                    configKey: showConfig
                },
                attributes: ['configKey', 'configValue'],
                raw: true
            });
            let data = {};
            if (configData.length > 0) {
                for (let item of configData) {
                    data[item.configKey] = item.configValue
                }
            }
            return {
                statusCode: 200,
                data
            };
        },
        options: {
            auth: false,
            tags: [routerPrefix, "index"],
            description: "get config",
            plugins: {
                encode: function (data) {
                    const response = new indexPb.indexResponse();
                    response.setTotalOutput(data.total_output);
                    return response.serializeBinary();
                },
                decode: function (payload) {
                    if (payload.proto) {
                        return indexPb.indexRequest.deserializeBinary(payload.proto).toObject();
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