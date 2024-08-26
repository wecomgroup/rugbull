const path = require('path');
const env = require('../config/env');
const fs = require('fs');
require('date-format-lite');


class logger {
    constructor({ service = "system", logDir = "../systemLogs", logPath = __dirname }) {
        this.service = service;
        this.log_path = path.join(logPath, logDir);
        this.openLog = env.DEBUG;
        if (!fs.existsSync(this.log_path)) {
            fs.mkdirSync(this.log_path);
        }
    }
    toObject(data) {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }
    error(message, item) {
        let options = {
            message,
            type: "error",
        }
        if (item instanceof Error) {
            options.item = {
                message: item.message,
                stack: item.stack
            }
        } else {
            options.item = item;
        }
        if (this.openLog) {
            options.output = "red";
        }
        return this.wirteFile(options);
    }

    debug(message, item) {
        let options = {
            message,
            item,
            type: "debug",
        }
        if (this.openLog) {
            options.output = "yellow";
        }
        return this.wirteFile(options);
    }

    info(message, item) {
        let options = {
            message,
            item,
            type: "info",
            output: "green"
        }
        return this.wirteFile(options);
    }

    wirteFile({ message, item, type, output = false } = {}) {
        let file_path = path.join(this.log_path, `${this.service}-${type}-${new Date().format('YYMMDD')}.log`);
        if (!fs.existsSync(file_path)) fs.closeSync(fs.openSync(file_path, 'w'))
        let content = `${new Date().format('YYMMDD hh:mm:ss')} ${message}`
        if (item) {
            content += `\r\n${JSON.stringify(this.toObject(item), null, '\t')}`
        }
        content += `\r\n-------------------------------------------------------------------------------------------\r\n`;
        if (this.openLog || output) {
            console.log(content);
        }
        fs.appendFileSync(file_path, content);
        return true;
    };
}

const sql = new logger({ service: "sql" });
const debug = new logger({ service: 'debug' });
const error = new logger({ service: "error" });
module.exports = {
    sql,
    debug,
    error,
    logger
}