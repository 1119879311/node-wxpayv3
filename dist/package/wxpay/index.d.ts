import { IPayAppParams, IpayH5parmas, IPayJSAPIParams, IPayNativeParams, Iqueryout_trade_no, Iqueryparmas, IWxPayBase } from "./interface";
export declare class WxPayBase {
    private appid;
    private mchid;
    private privatekey;
    private publicKey;
    private serial_no;
    private APIv3key;
    private authType;
    /**
     *
     * @param config
     */
    constructor(config: IWxPayBase);
    /**
     *
     * @param privatekey 获取公私钥
     */
    private getPrivatePublickey;
    /**
     * 获取证书序列号
     */
    getserialNo(): string;
    /**
     * 生成签名
     *
     * @param methond 请求类型 ,GET 类型后面还要多加一个\n
     * @param url 请求地址
     * @param timestamp  时间戳
     * @param nonceStr 随机数
     * @param body 请求报文
     */
    getSign(methond: string, url: string, timestamp: string | number, nonceStr: string, body?: string | object): string;
    /**
     *  构建 Authorization 签名,用户 http 请求头header携带
     * 微信支付商户API v3要求请求通过HTTPAuthorization 认证 ：认证类型 + 签名信息
     *  示例： 'Authorization: WECHATPAY2-SHA256-RSA2048 mchid="121212",......'
     * @param timestamp
     * @param nonceStr
     * @param signature
     */
    getAuthorization(timestamp: number | string, nonceStr: string, signature: string): string;
    /**
     * 初始化 Authorization
     */
    initAuthorization(methond: string, url: string, body?: string | object): string;
    /**
     * 获取请求头配置
     * @param authorization
     */
    getHeaders(authorization: string): {
        Authorization: string;
        Accept: string;
        'Content-type': string;
        'Wechatpay-Serial': string;
    };
    /**
     * 验证签名 : 使用公钥
     * @param timestamp : 通过HTTP头Wechatpay-Timestamp中的应答时间戳。
     * @param Nonce   通过HTTP头Wechatpay-Nonce中的应答随机串
     * @param data  应答主体（response Body）
     * @param signature  通过HTTP头Wechatpay-Signature传递
     * @param Serial 通过 HTTP头 Wechatpay-Serial
     *
     */
    verifySignature(timestamp: string, Nonce: string, data: string | object, signature: string, Serial: string): Promise<{
        status: boolean;
        error: string;
        data?: undefined;
    } | {
        status: true;
        data: string;
        error?: undefined;
    } | {
        status: false;
        data: string;
        error?: undefined;
    }>;
    /**
     * 回调报文解密
     * @param nonce
     * @param associatedData
     * @param ciphertext
     * @param apiv3key
     */
    decryptToJson(nonce: string, associatedData: string, ciphertext: string, apiv3key?: string): any;
    /**
     *
     * @param config
     */
    static create(config: IWxPayBase): WxPayBase;
    /**
     * post请求封装
     * @param url
     * @param params
     * @param headers
     */
    postRequest(url: string, params: object, headers: object): Promise<any>;
    /**
     *
     * @param url
     * @param headers
     */
    getRequest(url: string, headers: object): Promise<any>;
    /**
     * 获取 统一下单 的结果
     * @param url  h5,jsapi... 的下单接口
     * @param params 下单接口的参数
     */
    getBaseParams(url: string, params: Record<string, any>): Promise<any>;
    /**
     * 获取H5支付参数
     * @param params IpayH5parmas  h5 下单接口的参数
     * 下单接口返回跳转支付地址 {"h5_url":""}
     * @returns  success {stauts:true,data:{h5_url}}
     * @returns  fail {stauts:false,error}
     */
    pay_H5(params: IpayH5parmas): Promise<any>;
    /**
     * 获取jsapi 或者小程序 支付参数
     * 下单接口返回的预支付 id {prepay_id:""}
     * @param params IPayJSAPIParams jspai 下单接口的参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
     * @returns  success {stauts:true,data:{appId,timeStamp,nonceStr,package,signType,paySign}}
     * @returns  fail {stauts:false,error}
     *
     */
    pay_JSAPI(params: IPayJSAPIParams): Promise<any>;
    /**
     * 获取app支付参数
     * @param params:IPayAppParams  app下单接口参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_1.shtml
     * @returns  success {stauts:true,data:{appId,partnerid,timeStamp,nonceStr,package,prepayid,sign}}
     * @returns  fail {stauts:false,error}
     */
    pay_app(params: IPayAppParams): Promise<{
        stauts: boolean;
        data: {
            appId: string;
            partnerid: string;
            timeStamp: string;
            nonceStr: string;
            package: string;
            prepayid: any;
            sign: string;
        };
        error?: undefined;
    } | {
        error: any;
        stauts?: undefined;
        data?: undefined;
    }>;
    /**
     * 获取 Native 支付参数
     * @param params:IPayNativeParams Native下单接口参数 ：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
     */
    pay_native(params: IPayNativeParams): Promise<{
        stauts: boolean;
        data: any;
        error?: undefined;
    } | {
        error: any;
        stauts?: undefined;
        data?: undefined;
    }>;
    /**
     * 微信订单号查询或者 商户订单号查询
     *
     * @param params:Iqueryparmas  参数：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_2.shtml
     */
    query_order(params: Iqueryparmas): Promise<any>;
    /**
     * 关闭订单
     * @param params
     */
    colse_order(params: Iqueryout_trade_no): Promise<any>;
}
