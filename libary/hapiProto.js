const env = require('../config/env');
const utils = require('./utils');

const proto = {
    name: 'proto',
    version: '1.0.0',
    register: async function (server, options) {
        if (env.proto.enable) {
            // pre router
            server.ext('onPostAuth', async (request, h) => {
                if (request.method === 'post') {
                    if (request.payload) {
                        if (Object.keys(request.route.settings.plugins).includes("decode") && typeof request.route.settings.plugins.decode === 'function') {
                            request.payload = request.route.settings.plugins.decode(request.payload);
                        }
                    } else {
                        request.payload = {};
                    }
                }
                return h.continue;
            });
            // pre response
            server.ext('onPreResponse', async (request, h) => {
                if (request.method === 'post') {
                    if (!request.response.isBoom && request.response.statusCode == 200) {
                        if (request.response.source.data && Object.keys(request.response.source.data).length > 0) {
                            if (Object.keys(request.route.settings.plugins).includes("encode") && typeof request.route.settings.plugins.encode === 'function') {
                                request.response.source.data = request.route.settings.plugins.encode(request.response.source.data);
                            }
                        }
                    }
                }
                return h.continue;
            });
        }
        return true;
    }
};

module.exports = proto;
