const ioredis = require('ioredis');
const config = require('../config/redis');

const publish = new ioredis(config);
const subscribe = new ioredis(config);

module.exports = {
    publish,
    subscribe,
}
