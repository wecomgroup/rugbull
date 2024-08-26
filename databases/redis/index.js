// integratedServices.js
const ioredis = require('../../libary/ioredis');
const games = require('./games');
const telegram = require('./telegram');
const users=require('./users');
const systems=require('./systems');


module.exports = Object.assign(
    ioredis,
    games,
    telegram,
    users,
    systems
);