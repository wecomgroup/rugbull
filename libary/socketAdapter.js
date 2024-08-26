const pubsub = require('./pubSub');
const { createAdapter } = require("@socket.io/redis-adapter");

const adapter=createAdapter(pubsub.publish, pubsub.subscribe);


module.exports=adapter;