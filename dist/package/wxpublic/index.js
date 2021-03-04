"use strict";
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
exports.wxPulic = void 0;
const util_1 = require("../util");
const base_access_token_1 = require("./base_access_token");
const jsapi_ticket_1 = require("./jsapi_ticket");
const axios_1 = __importDefault(require("axios"));
class wxPulic {
    constructor(config) {
        this.baseAccessToken = new base_access_token_1.BaseAccessToken(config.appid, config.secret, config.tokenPath);
        this.jsapiTicket = new jsapi_ticket_1.JsapiTicket(config.ticketPath);
        this.config = config;
    }
    /**
     * 获取公众号jdk 配置参数
     * @param url
     */
    getJsSdk(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let accessToken = yield this.accessToken();
            let timestamp = util_1.getTimestamp();
            let nonceStr = util_1.getRandom();
            let jsapi_ticket = yield this.jsapiTicket.get(accessToken);
            let toStr = util_1.getQueryString({ nonceStr, jsapi_ticket, timestamp, url });
            let signature = util_1.sha1(toStr);
            return {
                appId: this.config.appid,
                timestamp,
                nonceStr,
                signature,
            };
        });
    }
    /**
     * 基础accessToken
     */
    accessToken() {
        return this.baseAccessToken.get();
    }
    /**
     * 获取网页的 accessToken,openid
     * @param code
     */
    codeAccessToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            // 用code获取网页授权的 access_token(两个小时),与基础的access_token不同
            let apiurl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.config.appid}&secret=${this.config.secret}&code=${code}&grant_type=authorization_code`;
            let { data } = yield axios_1.default.get(apiurl);
            return data;
        });
    }
    /**
     * 拉取用户信息(需scope为 snsapi_userinfo)
     * @param codeAccessToken :网页code 获取的token
     * @param openid 用户的唯一标识
     */
    getWxUserInfo(codeAccessToken, openid) {
        return __awaiter(this, void 0, void 0, function* () {
            let apiurl = `https://api.weixin.qq.com/sns/userinfo?access_token=${codeAccessToken}&openid=${openid}&lang=zh_CN`;
            //根据access_token 和openid 获取 授权用户信息
            let { data } = yield axios_1.default.get(apiurl);
            return data;
        });
    }
    /**
     * 验证微信服务器(公众号)
     * @param signature  返回的签名 (wxServe 返回的)
     * @param echostr 验证的输出 (wxServe 返回的)
     * @param timestamp  时间戳 (wxServe 返回的)
     * @param nonce  随机数 (wxServe 返回的)
     * @param token : 微信公众号后台设置的token 标识 (开发者自己配置的)
     */
    static varyfiyWxchatServer(signature, timestamp, nonce, token) {
        //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
        //2.将token、timestamp、nonce三个参数进行字典序排序
        //3.将三个参数字符串拼接成一个字符串进行sha1加密
        //4.获得加密后的字符串可与signature对比，标识该请求来源于微信
        let str = ([token, timestamp, nonce].sort()).join('');
        let resSign = util_1.sha1(str);
        return resSign === signature;
    }
    static create(config) {
        return new this(config);
    }
}
exports.wxPulic = wxPulic;
