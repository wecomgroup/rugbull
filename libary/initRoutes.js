const prefix = "/v1/"
const Boom = require('@hapi/boom');
const path = require('path');

module.exports = function (groups) {
    let newRoutes = [];
    for (let group of groups) {
        const pathParams = [prefix];
        let routerPrefix = '';
        if (group.routerPrefix) {
            routerPrefix += group.routerPrefix;
            if (group.routerSuffix) {
                routerPrefix += group.routerSuffix;
            }
            pathParams.push(routerPrefix);
        }
        for (let item of group.routers) {
            let routerPath = path.join(...pathParams, item.path);
            if (item.options.validate) {
                item.options.validate.failAction = async (request, h, err) => {
                    if (process.env.NODE_ENV === 'production') {
                        // In prod, log a limited error message and throw the default Bad Request error.
                        throw Boom.badRequest(`Invalid request payload input`);
                    } else {
                        // During development, log and respond with the full error.
                        throw err;
                    }
                }
            }
            newRoutes.push(Object.assign({}, item, { path: routerPath }));
        }
    }

    return newRoutes;
}
