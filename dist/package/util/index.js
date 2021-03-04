"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXml = exports.buildXml = exports.checkXml = exports.getQueryString = exports.Aes256GcmDecrypt = exports.sha256RsaVerify = exports.SHA256RSA = exports.sha256 = exports.sha1 = exports.md5 = exports.getToMoney = exports.getTimestamp = exports.getRandom = void 0;
const crypto = __importStar(require("crypto"));
const xml2js = __importStar(require("xml2js"));
// 生成随机数据
exports.getRandom = (len = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let res = '', maxLen = chars.length;
    while (len--) {
        res += chars[Math.floor(Math.random() * maxLen)];
    }
    return res;
};
// 生成时间戳
exports.getTimestamp = () => {
    return new Date().getTime();
};
//钱转分
exports.getToMoney = (money) => {
    return money * 100;
};
/**
 * md5 加密
 * @param str
 * @param encodeing
 */
exports.md5 = (str, encodeing = 'utf-8') => {
    return crypto.createHash('md5').update(str, encodeing).digest('hex');
};
/**
 * sha1 加密
 * @param str
 * @param encodeing
 */
exports.sha1 = (str, encodeing = 'utf-8') => {
    return crypto.createHash("sha1").update(str, encodeing).digest('hex');
};
/**
 * sha256 加密
 * @param str
 * @param key
 * @param encodeing
 */
exports.sha256 = (str, key, encodeing = 'utf-8') => {
    crypto.createHmac('sha256', key).update(str, encodeing).digest('hex');
};
/**
 * RSA-SHA256 加密
 * @param data
 * @param key
 */
exports.SHA256RSA = (data, key) => {
    return crypto.createSign('RSA-SHA256').update(data).sign(key, 'base64');
};
exports.sha256RsaVerify = (publicKey, signature, data) => {
    return crypto
        .createVerify('RSA-SHA256')
        .update(data)
        .verify(publicKey, signature, 'base64');
};
/**
  * AEAD_AES_256_GCM 解密
  * @param key  apiKey3
  * @param nonce  加密使用的随机串初始化向量
  * @param associatedData  附加数据包
  * @param ciphertext   密文
  */
exports.Aes256GcmDecrypt = (key, nonce, associatedData, ciphertext) => {
    let ciphertextBuffer = Buffer.from(ciphertext, 'base64');
    let authTag = ciphertextBuffer.slice(ciphertextBuffer.length - 16);
    let data = ciphertextBuffer.slice(0, ciphertextBuffer.length - 16);
    let decipherIv = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipherIv.setAuthTag(Buffer.from(authTag));
    decipherIv.setAAD(Buffer.from(associatedData));
    let decryptStr = decipherIv.update(data, undefined, 'utf8');
    decipherIv.final();
    return decryptStr;
};
//按照字段名的ASCII 码从小到大排序
function getQueryString(data) {
    let keys = Object.keys(data);
    let newKeys = keys.sort();
    let singArr = [];
    for (let i = 0; i < newKeys.length; i++) {
        let dataKey = newKeys[i];
        singArr.push(dataKey + '=' + data[dataKey]);
    }
    let sinStr = singArr.join("&");
    return sinStr;
}
exports.getQueryString = getQueryString;
/**
 * 检查是否xml
 * @param str
 */
function checkXml(str) {
    let reg = /^(<\?xml.*\?>)?(\r?\n)*<xml>(.|\r?\n)*<\/xml>$/i;
    return reg.test(str.trim());
}
exports.checkXml = checkXml;
/**
 * 对象转xml
 * @param data
 * @param rootName
 */
function buildXml(data, rootName = "xml") {
    let options = { rootName, allowSurrogateChars: true, cdata: true, headless: true };
    return new xml2js.Builder(options).buildObject(data);
}
exports.buildXml = buildXml;
//xml 转json
function parseXml(data) {
    let options = { trim: true, explicitArray: false, explicitRoot: false };
    return xml2js.parseStringPromise(data, options);
    // return new Promise((resolve,reject)=>{
    //     let options:xml2js.ParserOptions
    //     return  xml2js.parseString(data,options,err, res) => err ? reject(new Error('xmlError')) : resolve(res || {}))
    // })
}
exports.parseXml = parseXml;
