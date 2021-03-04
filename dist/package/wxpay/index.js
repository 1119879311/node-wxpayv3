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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxPayBase = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = require("../util");
const fs = __importStar(require("fs"));
const x509_1 = require("@fidm/x509");
const util_2 = require("../util");
class WxPayBase {
    /**
     *
     * @param config
     */
    constructor(config) {
        this.appid = config.appid;
        this.mchid = config.mchid;
        this.privatekey = this.getPrivatePublickey(config.privatekeyPath, "Private");
        this.publicKey = this.getPrivatePublickey(config.publicKeyPath, 'Public');
        this.serial_no = config.serial_no || this.getserialNo();
        this.APIv3key = config.APIv3key;
        this.authType = config.authType || 'WECHATPAY2-SHA256-RSA2048';
    }
    /**
     *
     * @param privatekey 获取公私钥
     */
    getPrivatePublickey(data, type) {
        if (!data) {
            throw new Error(`${type}key must type Buffer or String in filePath`);
        }
        if (data instanceof Buffer) {
            return data;
        }
        if (fs.existsSync(data)) {
            return fs.readFileSync(data);
        }
        throw new Error(`${type}key filepath is no exists`);
    }
    /**
     * 获取证书序列号
     */
    getserialNo() {
        if (!this.publicKey) {
            throw new Error("publicKey is no exist");
        }
        return x509_1.Certificate.fromPEM(this.publicKey).serialNumber;
    }
    /**
     * 生成签名
     *
     * @param methond 请求类型 ,GET 类型后面还要多加一个\n
     * @param url 请求地址
     * @param timestamp  时间戳
     * @param nonceStr 随机数
     * @param body 请求报文
     */
    getSign(methond, url, timestamp, nonceStr, body) {
        body = typeof body == "object" ? JSON.stringify(body) : body;
        let res = methond + '\n' + url + '\n' + timestamp + '\n' + nonceStr + '\n';
        if (body)
            res += body + '\n';
        if (methond.toLocaleUpperCase() == "GET")
            res += '\n';
        return util_2.SHA256RSA(res, this.privatekey);
    }
    /**
     *  构建 Authorization 签名,用户 http 请求头header携带
     * 微信支付商户API v3要求请求通过HTTPAuthorization 认证 ：认证类型 + 签名信息
     *  示例： 'Authorization: WECHATPAY2-SHA256-RSA2048 mchid="121212",......'
     * @param timestamp
     * @param nonceStr
     * @param signature
     */
    getAuthorization(timestamp, nonceStr, signature) {
        let resArr = [];
        resArr.push(`mchid="${this.mchid}"`);
        resArr.push(`serial_no="${this.serial_no}"`);
        resArr.push(`timestamp="${timestamp}"`);
        resArr.push(`nonceStr="${nonceStr}"`);
        resArr.push(`signature="${signature}"`);
        return this.authType.concat(" ").concat(resArr.join(","));
    }
    /**
     * 初始化 Authorization
     */
    initAuthorization(methond, url, body) {
        //时间戳
        let timestamp = util_1.getTimestamp();
        //随机数
        let nonceStr = util_1.getRandom();
        let signature = this.getSign(methond, url, timestamp, nonceStr, body);
        return this.getAuthorization(timestamp, nonceStr, signature);
    }
    /**
     * 获取请求头配置
     * @param authorization
     */
    getHeaders(authorization) {
        return {
            Authorization: authorization,
            Accept: 'application/json',
            'Content-type': 'application/json',
            'Wechatpay-Serial': this.serial_no,
        };
    }
    /**
     * 验证签名 : 使用公钥
     * @param timestamp : 通过HTTP头Wechatpay-Timestamp中的应答时间戳。
     * @param Nonce   通过HTTP头Wechatpay-Nonce中的应答随机串
     * @param data  应答主体（response Body）
     * @param signature  通过HTTP头Wechatpay-Signature传递
     * @param Serial 通过 HTTP头 Wechatpay-Serial
     *
     */
    verifySignature(timestamp, Nonce, data, signature, Serial) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Serial == this.serial_no) {
                return { status: false, error: "平台证书序列号 不一致,验证签名失败" };
            }
            data = typeof data == "object" ? JSON.stringify(data) : data;
            let verifyStr = [timestamp, Nonce, data, ''].join("\n");
            let resSign = util_1.sha256RsaVerify(this.publicKey, signature, verifyStr);
            return resSign ? { status: resSign, data: "success" } : { status: resSign, data: "fail" };
        });
    }
    /**
     * 回调报文解密
     * @param nonce
     * @param associatedData
     * @param ciphertext
     * @param apiv3key
     */
    decryptToJson(nonce, associatedData, ciphertext, apiv3key) {
        return JSON.parse(util_2.Aes256GcmDecrypt(apiv3key || this.APIv3key, nonce, associatedData, ciphertext));
    }
    /**
     *
     * @param config
     */
    static create(config) {
        return new this(config);
    }
    /**
     * post请求封装
     * @param url
     * @param params
     * @param headers
     */
    postRequest(url, params, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { data } = yield axios_1.default.post(url, params, { headers: headers });
                return { status: true, data };
            }
            catch (error) {
                return Object.assign({ status: false }, error.response);
            }
        });
    }
    /**
     *
     * @param url
     * @param headers
     */
    getRequest(url, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { data } = yield axios_1.default.get(url, { headers: headers });
                return { status: true, data };
            }
            catch (error) {
                return Object.assign({ status: false }, error.response);
            }
        });
    }
    /**
     * 获取 统一下单 的结果
     * @param url  h5,jsapi... 的下单接口
     * @param params 下单接口的参数
     */
    getBaseParams(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const _params = Object.assign({ appid: this.appid, mchid: this.mchid }, params);
            let authToken = this.initAuthorization("POST", url, _params);
            return yield this.postRequest(url, _params, this.getHeaders(authToken));
        });
    }
    /**
     * 获取H5支付参数
     * @param params IpayH5parmas  h5 下单接口的参数
     * 下单接口返回跳转支付地址 {"h5_url":""}
     * @returns  success {stauts:true,data:{h5_url}}
     * @returns  fail {stauts:false,error}
     */
    pay_H5(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const _url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5';
            return this.getBaseParams(_url, params);
        });
    }
    /**
     * 获取jsapi 或者小程序 支付参数
     * 下单接口返回的预支付 id {prepay_id:""}
     * @param params IPayJSAPIParams jspai 下单接口的参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
     * @returns  success {stauts:true,data:{appId,timeStamp,nonceStr,package,signType,paySign}}
     * @returns  fail {stauts:false,error}
     *
     */
    pay_JSAPI(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const _url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
            let result = yield this.getBaseParams(_url, params);
            if (result.data && result.data.prepay_id) {
                let prepay_id = result.data.prepay_id;
                let resData = {
                    appId: params.appid ? params.appid : this.appid,
                    timeStamp: util_1.getTimestamp() + '',
                    nonceStr: util_1.getRandom(),
                    package: `prepay_id=${prepay_id}`,
                    signType: 'RSA',
                    paySign: '',
                };
                const str = [resData.appId, resData.timeStamp, resData.nonceStr, resData.package, ''].join('\n');
                resData.paySign = util_2.SHA256RSA(str, this.privatekey);
                return { stauts: true, data: resData };
            }
            return Object.assign(Object.assign({}, (result.error || result.data)), { stauts: false });
        });
    }
    /**
     * 获取app支付参数
     * @param params:IPayAppParams  app下单接口参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_1.shtml
     * @returns  success {stauts:true,data:{appId,partnerid,timeStamp,nonceStr,package,prepayid,sign}}
     * @returns  fail {stauts:false,error}
     */
    pay_app(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const _url = "https://api.mch.weixin.qq.com/v3/pay/transactions/app";
            let result = yield this.getBaseParams(_url, params);
            if (result.data && result.data.prepay_id) {
                let prepay_id = result.data.prepay_id;
                let resData = {
                    appId: params.appid ? params.appid : this.appid,
                    partnerid: params.mchid ? params.mchid : this.mchid,
                    timeStamp: util_1.getTimestamp() + '',
                    nonceStr: util_1.getRandom(),
                    package: `Sign=WXPay`,
                    prepayid: prepay_id,
                    sign: '',
                };
                const str = [resData.appId, resData.timeStamp, resData.nonceStr, resData.prepayid, ''].join('\n');
                resData.sign = util_2.SHA256RSA(str, this.privatekey);
                return { stauts: true, data: resData };
            }
            return { error: result.error || result.data };
        });
    }
    /**
     * 获取 Native 支付参数
     * @param params:IPayNativeParams Native下单接口参数 ：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
     */
    pay_native(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const _url = "https://api.mch.weixin.qq.com/v3/pay/transactions/native";
            let result = yield this.getBaseParams(_url, params);
            if (result.data && result.data.code_url) {
                return { stauts: true, data: result.data };
            }
            return { error: result.error || result.data };
        });
    }
    /**
     * 微信订单号查询或者 商户订单号查询
     *
     * @param params:Iqueryparmas  参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_2.shtml
     */
    query_order(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let transaction_url = "https://api.mch.weixin.qq.com/v3/pay/transactions/id/";
            let out_trade_no = "https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/";
            let _url;
            let mchid = params.mchid || this.mchid;
            let _params = { mchid };
            if (params.transaction_id) {
                _url = `${transaction_url}${params.transaction_id}?mchid=${mchid}`;
                _params.transaction_id = params.transaction_id;
            }
            else if (params.out_trade_no) {
                _url = `${out_trade_no}${params.out_trade_no}?mchid=${mchid}`;
                _params.out_trade_no = params.out_trade_no;
            }
            else {
                throw new Error("transaction_id or out_trade_no is no empty");
            }
            let authToken = this.initAuthorization("GET", _url);
            return this.getRequest(_url, this.getHeaders(authToken));
        });
    }
    /**
     * 关闭订单
     * @param params
     */
    colse_order(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let _url = ` https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${params.out_trade_no}/close`;
            let _params = {
                mchid: params.mchid || this.mchid
            };
            let authToken = this.initAuthorization("POST", _url, _params);
            return this.postRequest(_url, _params, this.getHeaders(authToken));
        });
    }
}
exports.WxPayBase = WxPayBase;
