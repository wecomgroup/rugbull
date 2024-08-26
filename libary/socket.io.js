const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config')
const adapter = require('./socketAdapter');
const Boom = require('@hapi/boom');
const websocketRouter = require('../routers/websocket');
const ioredis = require('../databases/redis');
const db = require('../databases/mysql');
const env = require('../config/env');
const utils = require('./utils');
const i18n = require('./i18n');
const { logger } = require('./logs2');
const logs = new logger({
    service: "websocket",
});
const listen = {
    path: [],
    handler: {}
}

for (let item of websocketRouter) {
    listen.path.push(item.path);
    listen.handler[item.path] = item;
}


const io = new Server({
    cors: {
        origin: "*",
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ["GET", "POST", "OPTIONS"]
    },
    pingInterval: 5000,
    pingTimeout: 10000
});

io.adapter(adapter);

io.use(function (socket, next) {
    if (!socket.handshake.headers.authorization) {
        socket.send(Boom.unauthorized("Authentication error"));
        socket.disconnect();
        next(Boom.unauthorized("Authentication error"));
    }
    else {
        let token = jwt.decode(socket.handshake.headers.authorization, config.server.frontend.jwtKey);
        socket.user = token;
        if (!token || !token.userId || (new Date().getTime() - token.iat * 1e3) > 2592 * 1e6) {
            next(Boom.unauthorized("401.1"));
        }
        if (!env.DEBUG) {
            ioredis.hasLogin(token.userId, token.loginId).then(async res => {
                if (!res) {
                    next(Boom.unauthorized('401.2'));
                } else {
                    db.users.findOne({
                        where: {
                            rowId: token.userId
                        },
                        nest: true
                    }).then(user => {
                        if (!user) {
                           return next(Boom.unauthorized("401.3"));
                        }

                        next();
                    })
                }
                return true;
            });
        } else {
            next();
        }
    }
});

io.on("connection", (socket) => {
    if (!socket.user) {
        socket.disconnect(true);
        return false;
    }
    try {
        Promise.all([
            ioredis.setUserSocketId(socket.user.userId, socket.id),
            // 在线用户数自增
            ioredis.userOnline(),
            db.users.initUserInfo(socket.user.userId).then(userInfo => {
                if (userInfo) {
                    db.users_bet.getUserProcessGame(socket.user.userId).then(betList => {
                        userInfo.users_bet = betList;
                        socket.send('init', userInfo);
                        return true;
                    });
                } else {
                    socket.send(Boom.unauthorized('User login token expired'));
                    return socket.disconnect(true);
                }
                return true;
            })
        ]);
    } catch (error) {
        console.error(error);
        logs.error(error.message, {
            stack: error.stack,
            user: socket.user
        })
    }
    socket.once('disconnect', () => {
        Promise.all([
            // 在线用户数自减
            ioredis.userOffline(),
            socket.disconnect(true)
        ]).catch(error => {
            logs.error(error.message, {
                stack: error.stack,
                user: socket.user
            })
        })
    })
    socket.onAny((eventName, payload, callback) => {
        if (!callback) {
            callback = (data) => {
                socket.emit('message', data);
            }
        }
        if (!listen.path.includes(eventName) || !callback) {
            return callback(utils.getBoomPayload(Boom.notFound()));
        }
        const event = listen.handler[eventName];
        return ioredis.getUserSocketId(socket.user.userId)
            .then(cacheSocketId => {
                i18n.setLocale(i18n.detectLocaleFromAcceptedLanguages(socket.request.headers['accept-language']));
                i18n.t = i18n.__;
                if (cacheSocketId !== socket.id) {
                    throw Boom.unauthorized(i18n.t('User login token expired 8'));
                }
                if (Object.keys(event.options).length > 0) {
                    // if enable protobuf
                    if (config.proto.enable) {
                        // check protobuf decode
                        if (event.options.plugins && event.options.plugins.decode) {
                            paylod = event.options.plugins.decode(payload);
                        }
                    }

                    // check payload
                    if (event.options.validate && event.options.validate.payload) {
                        let { value, error } = event.options.validate.payload.validate(payload);
                        if (error) {
                            throw error;
                        }
                        payload = value;
                    }
                }
                const request = {
                    headers: socket.request.headers,
                    auth: {
                        credentials: socket.user,
                    },
                    payload,
                    i18n
                }
                return request;
            })
            .then((request) => {
                const response = event.handler(request, socket);
                return response;
            })
            .then((response) => {
                // if enable protobuf
                if (config.proto.enable) {
                    // check protobuf decode
                    if (event.options.plugins && event.options.plugins.encode) {
                        response.data = event.options.plugins.encode(response.data);
                    }
                }
                return response
            })
            .then(response => {
                return callback(response);
            })
            .catch(error => {
                if (!error.isBoom && !error.details) {
                    logs.error(error.message, {
                        stack: error.stack,
                        payload,
                        path: event.path
                    })
                }
                return callback(utils.getBoomPayload(error));
            });
    });
});

module.exports = io
