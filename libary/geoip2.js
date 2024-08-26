const path = require('path')
const maxmind = require('maxmind');
const dbPath = path.join(__dirname, '../databases/', 'GeoLite2-City.mmdb');


module.exports = {
    async getCity(ip) {
        try {
            const lookup = await maxmind.open(dbPath);
            const ipInfo=lookup.get(ip);
            return ipInfo;
        } catch (error) {
            return null;
        }
    }
}