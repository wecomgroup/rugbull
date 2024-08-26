//               0       8       16      24      32      40      48      56     63
//               v       v       v       v       v       v       v       v      v
const _Rixits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";

module.exports = {
    Base64: {

        // You have the freedom, here, to choose the glyphs you want for
        // representing your base-64 numbers. The ASCII encoding guys usually
        // choose a set of glyphs beginning with ABCD..., but, looking at
        // your update #2, I deduce that you want glyphs beginning with
        // 0123..., which is a fine choice and aligns the first ten numbers
        // in base 64 with the first ten numbers in decimal.

        // This cannot handle negative numbers and only works on the
        //     integer part, discarding the fractional part.
        // Doing better means deciding on whether you're just representing
        // the subset of javascript numbers of twos-complement 32-bit integers
        // or going with base-64 representations for the bit pattern of the
        // underlying IEEE floating-point number, or representing the mantissae
        // and exponents separately, or some other possibility. For now, bail
        fromNumber: function (number) {
            if (isNaN(Number(number)) || number === null ||
                number === Number.POSITIVE_INFINITY)
                throw "The input is not valid";
            if (number < 0)
                throw "Can't represent negative numbers now";

            var rixit; // like 'digit', only in some non-decimal radix
            var residual = Math.floor(number);
            var result = '';
            while (true) {
                rixit = residual % 64
                // console.log("rixit : " + rixit);
                // console.log("result before : " + result);
                result = _Rixits.charAt(rixit) + result;
                // console.log("result after : " + result);
                // console.log("residual before : " + residual);
                residual = Math.floor(residual / 64);
                // console.log("residual after : " + residual);

                if (residual == 0)
                    break;
            }
            return result;
        },

        toNumber: function (rixits) {
            var result = 0;
            // console.log("rixits : " + rixits);
            // console.log("rixits.split('') : " + rixits.split(''));
            rixits = _Rixits.split('');
            for (var e = 0; e < rixits.length; e++) {
                // console.log("_Rixits.indexOf(" + rixits[e] + ") : " +
                // this._Rixits.indexOf(rixits[e]));
                // console.log("result before : " + result);
                result = (result * 64) + _Rixits.indexOf(rixits[e]);
                // console.log("result after : " + result);
            }
            return result;
        }
    },
    agentId: {
        encode(number) {
            return Number(number * 299).toString(36)
        },
        decode(str) {
            return parseInt(str, 36) / 299
        }
    },

    brows($agent) {//移动终端浏览器版本信息
        return {
            ios: !!$agent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: $agent.indexOf('Android') > -1 || $agent.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: $agent.indexOf('iPhone') > -1 || $agent.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: $agent.indexOf('iPad') > -1, //是否iPad
        }
    },
    generateMixed(n) {
        let str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        let res = "";
        for (let i = 0; i < n; i++) {
            let id = Math.ceil(Math.random() * 35);
            res += str[id];
        }
        return res;
    },

    generateVerifyCode(n) {
        let str = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let res = "";
        for (let i = 0; i < n; i++) {
            let id = Math.ceil(Math.random() * 8);
            res += str[id];
        }
        return res;
    },
    parseBody(data) {
        const enc = Uint8Array.from(data.map(item => ~-item));
        return enc;
    },
    hidden(str, frontLen, endLen) {
        //str：要进行隐藏的变量  frontLen: 前面需要保留几位    endLen: 后面需要保留几位
        let len = str.length - frontLen - endLen;
        let xing = "";
        for (let i = 0; i < len; i++) {
            xing += "*";
        }
        return (str.substring(0, frontLen) + xing + str.substring(str.length - endLen));
    },
    hiddenEmail(str, frontLen, endLen) {
        let data = str.split('@');
        let prefix = data[0].substring(0, frontLen) + '****' + data[0].substring(data[0].length - endLen, data[0].length);
        return [prefix, data[1]].join('@');
    },

    checkEmail(str) {
        const regEmail = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
        return regEmail.test(str);
    },
    user_agent_hex(agent) {
        return crypto.createHmac('md5', "thinkphp3.2").update(agent).digest('hex').toString()
    },
    checkMobile(str) {
        const regMobile = /^(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/
        return regMobile.test(str);
    },
    buffFlip(buff) {
        return Object.values(buff).map(item => Math.abs(~item))
    },
    compareStrings(str1, str2) {
        return String(str1).toLowerCase() == String(str2).toLowerCase();
    },
    getBoomPayload(boom) {
        // boom
        if (boom.isBoom) {
            return boom.output.payload;
        }
        // joi
        if (boom.details) {
            return {
                statusCode: 400,
                error: "Parameter validation error.",
                message: boom.details[0].message,
                details: boom.details
            }
        }
        // default
        return {
            statusCode: 502,
            error: "Bad Gateway",
            message: "Unknown Error",
        }
    },
}
