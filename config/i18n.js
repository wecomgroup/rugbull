const path=require('path');

const config = {
    locales: [
        "de", "es", "it", "ko", "pt", "th", "vi",
        "en", "in", "ja", "pl", "ru", "tl", "zh-CN", "zh-HK", 'ar', 'tr'
    ],
    directory: path.join(__dirname, '../locales/'),
    languageHeaderField: 'Accept-language',
    defaultLocale: 'en',
    api: {
        __: 't', // now req.__ becomes req.t
        __n: 'tn' // and req.__n can be called as req.tn
    },
}

module.exports=config;