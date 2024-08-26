const command = require('./command');

const routers = [
    ...command,
]

routers.push({
    path: /^\/help$/,
    description: ["获取帮助信息", '/help'],
    handler: async function (msg) {
        let message = routers.map(item => {
            return `${item.description[0]}\r\n${this.markdown(item.description[1])}`;
        });
        this.sendMessage(msg.chat.id, message.join('\r\n'), {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    }
})

module.exports = routers