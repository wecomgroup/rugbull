const db = require('../../databases/mysql');
const Joi = require('joi')
const Boom = require('@hapi/boom');
const redis = require('../../databases/redis');
const emit = require('../../libary/socketEmit');
const routerPrefix = "users";
const routerSuffix = ".php"

const routers = [
    {
        method: ['POST'],
        path: '/speed/list',
        handler: async (request, h) => {
            const list = await db.card_list.findAll({
                attributes: [
                    "id",
                    "cardType",
                    "cardPrice",
                    "cardValue",
                    "isLimit",
                    "usageLimit",
                ],
                where: {
                    props_type: "speedUpCard",
                    cardState: 1,
                }
            });
            return list;
        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "buy"],
            description: "user buy magic cards",
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
    }
]


module.exports = {
    routers,
    routerPrefix,
    routerSuffix
};