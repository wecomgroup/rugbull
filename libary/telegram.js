const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const languages = require('./languages');


class Bot extends TelegramBot {
    constructor(token, options = { polling: false }) {
        super(token, options)
        this.token = token;
    }

    operation(msg) {
        if (!String(msg.text).match(/\.\d+\./) && String(msg.text).match(/[-+*\/]/)) {
            let amount = false;
            try {
                amount = eval(String(msg.text).trim());
                if (amount !== false) {
                    const chat_id = msg.chat.id;
                    this.sendMessage(chat_id, amount, { reply_to_message_id: msg.message_id });
                }
            } catch (error) {
                // 无需处理
            }
            return true;
        }
    }

    fromGroup(msg) {
        return ['group', 'supergroup'].includes(msg.chat.type);
    }

    markdown(str) {
        return '`' + str + '`';
    }

    checkTelegramAuthData(authData) {
        const secretKey = crypto.createHash('sha256').update(this.token).digest();
        const { hash } = authData;
        const dataCheckString = Object.keys(authData)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => (`${key}=${authData[key]}`))
            .join('\n');

        const hmac = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        return hmac === hash;
    }


    verifyInitData(telegramInitData) {
        const urlParams = new URLSearchParams(telegramInitData);

        const hash = urlParams.get('hash');
        urlParams.delete('hash');
        urlParams.sort();

        let dataCheckString = '';
        for (const [key, value] of urlParams.entries()) {
            dataCheckString += `${key}=${value}\n`;
        }
        dataCheckString = dataCheckString.slice(0, -1);

        const secret = crypto.createHmac('sha256', 'WebAppData').update(this.token);
        const calculatedHash = crypto.createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

        return calculatedHash === hash;
    }


    getLanguageCode(msg) {
        return languages[msg.from.language_code] || msg.from.language_code;
    }

    encodeToHTMLEntities(text) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '@': '&#64;'
        };
        return text.replace(/[&<>"'@]/g, (character) => entities[character]);
    }

    async setCommand(routers) {
        const commands = routers.map(item => {
            return {
                command: item.description[1].replace('/', ''),
                description: item.description[0]
            }
        });
        return this.setMyCommands(commands);
    }

}

module.exports = Bot;