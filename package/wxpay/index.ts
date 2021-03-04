import axios from 'axios';
import { getTimestamp, getRandom, sha256RsaVerify } from '../util';
import { IPayAppParams, IpayH5parmas, IPayJSAPIParams, IPayNativeParams, Iqueryout_trade_no, Iqueryparmas, IWxPayBase } from "./interface";

import * as fs from "fs"
import {Certificate} from "@fidm/x509"
import { Aes256GcmDecrypt, SHA256RSA } from "../util";



export class WxPayBase{
    private appid:string   //应用id
    private mchid:string   //商户id
    private privatekey: Buffer  //私钥
    private publicKey: Buffer  //公钥
    private serial_no:string //证书序列号
    private APIv3key:string   //APIv3key 
    private authType:string   //认证方式:默认WECHATPAY2-SHA256-RSA2048

    /**
     * 
     * @param config 
     */

    constructor(config:IWxPayBase){
        this.appid = config.appid
        this.mchid = config.mchid
        this.privatekey = this.getPrivatePublickey(config.privatekeyPath,"Private")
        this.publicKey = this.getPrivatePublickey(config.publicKeyPath,'Public')
        this.serial_no = config.serial_no || this.getserialNo()
        this.APIv3key = config.APIv3key 
        this.authType = config.authType || 'WECHATPAY2-SHA256-RSA2048'
    }
    /**
     * 
     * @param privatekey 获取公私钥
     */
    private getPrivatePublickey (data:string |Buffer,type:"Private"|"Public"):Buffer{
        if(!data){
            throw new Error(`${type}key must type Buffer or String in filePath`)
        }
        if(data instanceof Buffer){
            return data
        }
        if(fs.existsSync(data)){
            return fs.readFileSync(data)
        }
        throw new Error(`${type}key filepath is no exists`)
    }
    /**
     * 获取证书序列号
     */
    public getserialNo(){
        if(!this.publicKey){
            throw new Error("publicKey is no exist")
        }
        return Certificate.fromPEM(this.publicKey).serialNumber
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
    public getSign(methond:string,url:string,timestamp:string|number,nonceStr:string,body?:string | object){
        body = typeof body =="object"?JSON.stringify(body) : body
        let res =methond + '\n' + url +'\n' + timestamp +'\n' + nonceStr +'\n' ;
        if(body)  res +=body +'\n'
        if(methond.toLocaleUpperCase()=="GET") res +='\n';
        return SHA256RSA(res,this.privatekey)

    }
    /**
     *  构建 Authorization 签名,用户 http 请求头header携带
     * 微信支付商户API v3要求请求通过HTTPAuthorization 认证 ：认证类型 + 签名信息
     *  示例： 'Authorization: WECHATPAY2-SHA256-RSA2048 mchid="121212",......'
     * @param timestamp 
     * @param nonceStr 
     * @param signature 
     */
    public getAuthorization(timestamp:number|string, nonceStr:string,signature:string){

        let resArr = [];
        resArr.push(`mchid="${this.mchid}"`)
        resArr.push(`serial_no="${this.serial_no}"`)
        resArr.push(`timestamp="${timestamp}"`)
        resArr.push(`nonceStr="${nonceStr}"`)
        resArr.push(`signature="${signature}"`)
        return this.authType.concat(" ").concat(resArr.join(","))
    }
    /**
     * 初始化 Authorization 
     */
    public initAuthorization(methond:string,url:string,body?:string | object){
        //时间戳
        let timestamp = getTimestamp()
        //随机数
        let nonceStr = getRandom()

        let signature = this.getSign(methond,url,timestamp,nonceStr,body)

        return this.getAuthorization(timestamp,nonceStr,signature)
    }

    /**
     * 获取请求头配置
     * @param authorization 
     */
    public getHeaders(authorization:string){
        return {
            Authorization: authorization,
            Accept: 'application/json',
            'Content-type': 'application/json',
            'Wechatpay-Serial': this.serial_no,
        }
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
    public async verifySignature(timestamp:string,Nonce:string,data:string | object,signature:string,Serial:string){
        if(Serial ! == this.serial_no){
            return {status:false,error:"平台证书序列号 不一致,验证签名失败"}
        }
        data = typeof data =="object"?JSON.stringify(data):data 
       let verifyStr = [timestamp,Nonce,data,''].join("\n")
       let resSign = sha256RsaVerify(this.publicKey,signature,verifyStr)
       return resSign ? {status:resSign,data:"success" } : {status:resSign,data:"fail" }

    }
    /**
     * 回调报文解密
     * @param nonce 
     * @param associatedData 
     * @param ciphertext 
     * @param apiv3key 
     */
    public decryptToJson(nonce: string, associatedData: string, ciphertext: string,apiv3key?:string){
       return JSON.parse(Aes256GcmDecrypt(apiv3key||this.APIv3key,nonce,associatedData,ciphertext))  
    }



    /**
     * 
     * @param config 
     */
    public static create(config:IWxPayBase){
        return new this(config)
    }
    /**
     * post请求封装
     * @param url 
     * @param params 
     * @param headers 
     */
    public async  postRequest(url:string,params:object,headers:object){
        try {
            let {data} = await   axios.post(url,params,{headers:headers})
            return {status:true,data}
        } catch (error) {
            return {status:false,...error.response}
        }
    }
    /**
     * 
     * @param url 
     * @param headers 
     */
    public async  getRequest(url:string,headers:object){
        try {
            let {data} = await   axios.get(url,{headers:headers})
            return {status:true,data}
        } catch (error) {
            return {status:false,...error.response}
        }
    }


    /**
     * 获取 统一下单 的结果 
     * @param url  h5,jsapi... 的下单接口
     * @param params 下单接口的参数
     */
    public async getBaseParams(url:string,params:  Record<string,any>){
        const _params = {
            appid: this.appid,
            mchid: this.mchid,
            ...params,
        };
        let authToken = this.initAuthorization("POST",url,_params)
        return await this.postRequest(url,_params,this.getHeaders(authToken))
    }

    /**
     * 获取H5支付参数
     * @param params IpayH5parmas  h5 下单接口的参数 
     * 下单接口返回跳转支付地址 {"h5_url":""}
     * @returns  success {stauts:true,data:{h5_url}}
     * @returns  fail {stauts:false,error}
     */
    public async pay_H5(params:IpayH5parmas){
        const _url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5'
        return this.getBaseParams(_url,params)
    }

    /**
     * 获取jsapi 或者小程序 支付参数
     * 下单接口返回的预支付 id {prepay_id:""}
     * @param params IPayJSAPIParams jspai 下单接口的参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
     * @returns  success {stauts:true,data:{appId,timeStamp,nonceStr,package,signType,paySign}}
     * @returns  fail {stauts:false,error}
     * 
     */
    public async pay_JSAPI(params:IPayJSAPIParams){
        const _url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi'
        let result = await this.getBaseParams(_url,params)
        if(result.data && result.data.prepay_id){
            let prepay_id = result.data.prepay_id
            let resData = {
                appId: params.appid? params.appid: this.appid,
                timeStamp: getTimestamp()+'',
                nonceStr:getRandom(),
                package: `prepay_id=${prepay_id}`,
                signType: 'RSA',
                paySign: '',
            }
            const str = [resData.appId, resData.timeStamp, resData.nonceStr, resData.package, ''].join('\n');
            resData.paySign = SHA256RSA(str,this.privatekey)

            return {stauts:true,data:resData}

        }
        return {...(result.error ||result.data),stauts:false}

    }
    /**
     * 获取app支付参数
     * @param params:IPayAppParams  app下单接口参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_1.shtml
     * @returns  success {stauts:true,data:{appId,partnerid,timeStamp,nonceStr,package,prepayid,sign}}
     * @returns  fail {stauts:false,error}
     */
    public async pay_app(params:IPayAppParams){
        const _url = "https://api.mch.weixin.qq.com/v3/pay/transactions/app"
        let result = await this.getBaseParams(_url,params)
        if(result.data && result.data.prepay_id){
            let prepay_id = result.data.prepay_id
            let resData = {
                appId: params.appid? params.appid: this.appid,
                partnerid: params.mchid?params.mchid:this.mchid,
                timeStamp: getTimestamp()+'',
                nonceStr:getRandom(),
                package: `Sign=WXPay`,
                prepayid:prepay_id,
                sign: '',
            }
            const str = [resData.appId, resData.timeStamp, resData.nonceStr, resData.prepayid, ''].join('\n');
            resData.sign = SHA256RSA(str,this.privatekey)

            return {stauts:true,data:resData}

        }
        return {error:result.error ||result.data}

    }
    /**
     * 获取 Native 支付参数
     * @param params:IPayNativeParams Native下单接口参数 ：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
     */
    public  async pay_native(params:IPayNativeParams) {
        const _url = "https://api.mch.weixin.qq.com/v3/pay/transactions/native"
        let result = await this.getBaseParams(_url,params)
        if(result.data && result.data.code_url){
            return {stauts:true,data:result.data}
        }
        
        return {error:result.error ||result.data}
    }
    /**
     * 微信订单号查询或者 商户订单号查询 
     * 
     * @param params:Iqueryparmas  参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_2.shtml
     */
    public async query_order(params:Iqueryparmas){
        let transaction_url =  "https://api.mch.weixin.qq.com/v3/pay/transactions/id/"
        let out_trade_no = "https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/"
        let _url;
        let  mchid = params.mchid || this.mchid
        let _params:Record<string,any> = {mchid}
        if(params.transaction_id){
            _url = `${transaction_url}${params.transaction_id}?mchid=${mchid}`
            _params.transaction_id = params.transaction_id
        }else if(params.out_trade_no){
            _url = `${out_trade_no}${params.out_trade_no}?mchid=${mchid}`
            _params.out_trade_no = params.out_trade_no
        }else {
            throw new Error("transaction_id or out_trade_no is no empty")
        }
        let authToken = this.initAuthorization("GET",_url)
        return this.getRequest(_url,this.getHeaders(authToken))

    }
    /**
     * 关闭订单
     * @param params 
     */
    public async colse_order(params:Iqueryout_trade_no){
        let _url = ` https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${params.out_trade_no}/close`
        let _params = {
            mchid:params.mchid || this.mchid
        }
        let authToken = this.initAuthorization("POST",_url,_params)
        return this.postRequest(_url,_params,this.getHeaders(authToken))


    }
     
    
}