import { getQueryString, getRandom, getTimestamp,sha1 } from "../util";
import { BaseAccessToken } from "./base_access_token";
import { JsapiTicket } from "./jsapi_ticket";
import axios from "axios"
interface IwxPublic {
    appid:string,
    secret:string,
    tokenPath?:string
    ticketPath?:string
}

export class wxPulic{
    private baseAccessToken:BaseAccessToken
    private jsapiTicket:JsapiTicket
    private config :IwxPublic
    constructor(config:IwxPublic){
        this.baseAccessToken = new BaseAccessToken(config.appid,config.secret,config.tokenPath)
        this.jsapiTicket = new JsapiTicket(config.ticketPath)
        this.config = config

    }
    /**
     * 获取公众号jdk 配置参数 
     * @param url 
     */
    public async getJsSdk(url:string){
        let accessToken =  await this.accessToken()
        let timestamp = getTimestamp()
        let nonceStr = getRandom()
        let jsapi_ticket =await this.jsapiTicket.get(accessToken);
        let toStr = getQueryString({nonceStr,jsapi_ticket,timestamp,url})
        let signature = sha1(toStr)
        return {
            appId:this.config.appid,
            timestamp,
            nonceStr,
            signature,
        }
    }
    /**
     * 基础accessToken
     */
    public accessToken(){
        return this.baseAccessToken.get();
    }

    /**
     * 获取网页的 accessToken,openid
     * @param code 
     */

    public async codeAccessToken(code:string){
        // 用code获取网页授权的 access_token(两个小时),与基础的access_token不同
        let apiurl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.config.appid}&secret=${this.config.secret}&code=${code}&grant_type=authorization_code`
        let {data} = await axios.get(apiurl)
        return data
    }

    /**
     * 拉取用户信息(需scope为 snsapi_userinfo)
     * @param codeAccessToken :网页code 获取的token
     * @param openid 用户的唯一标识
     */
    public async getWxUserInfo(codeAccessToken:string,openid:string){
        let apiurl = `https://api.weixin.qq.com/sns/userinfo?access_token=${codeAccessToken}&openid=${openid}&lang=zh_CN`;
         //根据access_token 和openid 获取 授权用户信息
        let {data} = await axios.get(apiurl)
        return data

    }

    /**
     * 验证微信服务器(公众号)
     * @param signature  返回的签名 (wxServe 返回的)
     * @param echostr 验证的输出 (wxServe 返回的)
     * @param timestamp  时间戳 (wxServe 返回的)
     * @param nonce  随机数 (wxServe 返回的)
     * @param token : 微信公众号后台设置的token 标识 (开发者自己配置的)
     */
  
    public static  varyfiyWxchatServer(signature:string,timestamp:string,nonce:string,token:string){
        //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
        //2.将token、timestamp、nonce三个参数进行字典序排序
        //3.将三个参数字符串拼接成一个字符串进行sha1加密
        //4.获得加密后的字符串可与signature对比，标识该请求来源于微信
        let str = ([token,timestamp,nonce].sort()).join('');
        let resSign = sha1(str)
        return resSign === signature
    }
    public static create(config:IwxPublic){
        return new this(config)
    }
}