const ioredis = require('ioredis');
const config = require('../config');

class redis extends ioredis {
    constructor(config) {
        super(config);
    }

}

module.exports = new redis(config.redis);
