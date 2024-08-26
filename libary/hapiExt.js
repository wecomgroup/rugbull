const ext = {
    name: 'ext',
    version: '1.0.0',
    register: async function (server, options) {
        server.ext('onRequest', (request, h) => {
            const xFF = request.headers['x-forwarded-for'];
            const ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
            const ipnation = request.headers['cf-ipcountry'] || "en";
            request.info.ipaddr = ip;
            request.info.ipnation = ipnation;
            request.info.hostname = host = request.headers.host;
            return h.continue;
        });
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;
            if (response.isBoom) {
                // 如果响应是错误响应（Boom对象）
                const statusCode = response.output.statusCode;
                if (statusCode !== 404) {
                    // 修改状态码为200
                    response.output.statusCode = 200;
                }
            }
            return h.continue;
        });
        return true;
    }
};

module.exports = ext;
