const io = require('./socket.io');

const socketIo = {
    name: 'socketIo',
    version: '1.0.0',
    register: async function (server, options) {
        server.route({
            method: 'OPTIONS',
            path: '/socket.io/',
            handler: async function (request, h) {
                const response = h.response('ok');
                return response.takeover();
            },
            options: {
                auth: false,
                cors: {
                    origin: ['*'],
                    maxAge: 86400,
                    // credentials: true,
                    headers: ["Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"],
                    additionalHeaders: ["Access-Control-Allow-Headers", 'Access-Control-Allow-Methods', 'cache-control', 'x-requested-with'],
                    exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'],
                }
            }
        });
        io.attach(server.listener);
        return true;
    }
};

module.exports = socketIo;
