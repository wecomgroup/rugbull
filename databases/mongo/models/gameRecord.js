
const { Schema, Types } = require('mongoose');

const modelName = 'gameRecord';
const schema = new Schema({
    elapsed: Number,
    // 0 unready 1 starting 2 process 3 crash
    status: Number,
    startTime: Date,
    round: Number,
    multiplier: Types.Decimal128
});

module.exports = {
    modelName,
    schema
};