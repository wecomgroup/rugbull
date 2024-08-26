const db = require('../../databases/mysql');
const Joi = require('joi')
const Boom = require('@hapi/boom');
const emit = require('../../libary/socketEmit');
const { Op, fn, col } = require('sequelize');
const routerPrefix = "magicCard";
const routerSuffix = ".php"
const rq = require('../../databases/rabbitmq/magic_cards')
const CardExpirationInfo = require('../../databases/rabbitmq/model/card_expiration_info')

const routers = [
    {
        method: ['POST'],
        path: '/cards',
        handler: async (request, h) => {
            const cards = await db.magic_cards.findAll({
                attributes: [
                    "rowId",
                    "name",
                    "type",
                    "price",
                    "duration",
                    "effect_amount",
                    "description"

                ]
            });
            return {
                statusCode: 200,
                data: {
                    cards
                }
            }

        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "list"],
            description: "Get all magic cards",
            plugins: {
                
            },
        },
    },
    {
        method: ['POST'],
        path: '/buy',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const { cardId } = request.payload;
            // 未來不排除可以一次買好幾張
            const amount = 1;

            const transaction = await db.client.sequelize.transaction();
            try {
                // Fetch card details from database based on cardId
                const card = await db.magic_cards.findOne({
                    where: { rowId: cardId }
                });
                if (!card) {
                    return Boom.notFound(request.i18n.__("Card not found"));
                }

                const totalCost = card.price * amount;
                const userWallet = await db.users_wallet.findOne({
                    where: {
                        rowId: userId
                    },
                    transaction
                });
                if (userWallet.balance < totalCost) {
                    return Boom.paymentRequired(request.i18n.__("Insufficient balance"));
                }
                // Deduct balance
                await db.users_wallet.decrementBalance(userId, totalCost, 'buy_card', 'Buy Magic Card', transaction);

                const handler = cardHandlers[card.type];
                if (handler) {
                    await handler(userId, card, transaction);
                } else {
                    throw new Error("Invalid card type");
                }

                await transaction.commit();

                // Emit balance change event
                await emit.changeBalance(userId);

                return {
                    statusCode: 200,
                    data: {
                        cardId,
                        cardName: card.name,
                        newBalance: userWallet.userBonus - totalCost
                    }
                };
            } catch (error) {
                console.log(error)
                await transaction.rollback();
                return Boom.internal(error.message);
            }
        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "buyMagicCard"],
            description: "Buy Magic Card",
            validate: {
                payload: Joi.object({
                    cardId: Joi.number().integer().positive().required(),
                    //amount: Joi.number().min(1).max(100).required()
                }),
            },
            plugins: {
                
            }
        },
    },
    {
        method: ['POST'],
        path: '/user/activeBuffs',
        handler: async (request, h) => {
            const userId = request.auth.credentials.userId;
            const now = new Date();

            try {
                const activeBuffs = await db.users_magic_card_totals.findAll({
                    attributes: [
                        "type",
                        "totalExpirationTime",
                        "totalPoolSize"
                    ],
                    where: {
                        userId,
                        totalExpirationTime: {
                            [Op.gte]: now
                        }
                    },
                    order: [[col('totalExpirationTime'), 'DESC']]
                });

                return {
                    statusCode: 200,
                    data: activeBuffs.map(buff => ({
                        expirationTime: buff.get('totalExpirationTime'),
                        card: {
                            type: buff.type,
                            effect_amount: buff.totalPoolSize
                        }
                    }))
                };
            } catch (e) {
                console.error(e);
                return h.response({ statusCode: 500, error: 'Internal Server Error' }).code(500);
            }
        },
        options: {
            auth: "jwt",
            tags: [routerPrefix, "activeBuffs"],
            description: "Get active buffs for the user",
            plugins: {
                
            },
        },
    }
]

const cardHandlers = {
    'Expand pool': async (userId, card, transaction) => {
        const userEnergy = await db.users_energy.findOne({
            where: {rowId: userId},
            transaction
        });

        if (userEnergy) {
            const newCapacity = userEnergy.energyCapacity + (card.effect_amount || 0);
            await db.users_energy.updateEnergyCapacity(userId, newCapacity, transaction);

            const purchaseTime = new Date();
            const expirationTime = null;

            await db.users_magic_cards.create({
                userId,
                cardId: card.rowId,
                amount: 1,
                purchaseTime,
                expirationTime
            }, {transaction});

            await db.users_magic_card_totals.incrementTotals(
                userId,
                'Expand pool',
                0,
                card.effect_amount || 0,
                transaction
            );

            return true;
        }
        throw new Error('User energy not found');
    },

    'Speed up': async (userId, card, transaction) => {
        const now = new Date();
        const purchaseTime = new Date();

        await db.users_magic_cards.create({
            userId,
            cardId: card.rowId,
            amount: 1,
            purchaseTime,
            expirationTime: null
        }, { transaction });

        await db.users_magic_card_totals.incrementTotals(
            userId,
            'Speed up',
            card.duration || 0,
            0,
            transaction
        );

        const updatedTotals = await db.users_magic_card_totals.findUserTotals(userId, 'Speed up', transaction);
        if (!updatedTotals) {
            throw new Error('Failed to retrieve updated totals.');
        }
        const expirationTime = new Date(updatedTotals.totalExpirationTime);

        const delayTimeTolerance = 5;
        const delayTime = Math.ceil((expirationTime.getTime() - now.getTime()) / 1000) + delayTimeTolerance;

        const cardExpirationInfo = new CardExpirationInfo(userId, card.rowId, now, expirationTime);
        await rq.setNewJob(cardExpirationInfo, delayTime);

        await db.users_energy.update(
            { energyAccumulationRate: 2 },
            { where: { rowId: userId }, transaction }
        );
    },

    'Double winning': async (userId, card, transaction) => {
        const now = new Date();
        const purchaseTime = new Date();

        await db.users_magic_cards.create({
            userId,
            cardId: card.rowId,
            amount: 1,
            purchaseTime,
            expirationTime: null
        }, { transaction });

        await db.users_magic_card_totals.incrementTotals(
            userId,
            'Double winning',
            card.duration || 0,
            0,
            transaction
        );

        const updatedTotals = await db.users_magic_card_totals.findUserTotals(userId, 'Double winning', transaction);
        if (!updatedTotals) {
            throw new Error('Failed to retrieve updated totals.');
        }
        const expirationTime = new Date(updatedTotals.totalExpirationTime);

        const delayTimeTolerance = 5;
        const delayTime = Math.ceil((expirationTime.getTime() - now.getTime()) / 1000) + delayTimeTolerance;

        const cardExpirationInfo = new CardExpirationInfo(userId, card.rowId, now, expirationTime);
        await rq.setNewJob(cardExpirationInfo, delayTime);

        await db.users_wallet.update(
            { winMultiplier: 2 },
            { where: { rowId: userId }, transaction }
        );
    }
};

module.exports = {
    routers,
    routerPrefix,
    routerSuffix
};