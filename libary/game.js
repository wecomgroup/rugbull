
module.exports = {
    calculateOdds(ms) {
        const r = 0.0000597;
        return Math.pow(Math.E, r * ms);
    },
    calculateMs(odds) {
        const r = 0.0000597;
        return Math.log(odds) / r;
    }
}