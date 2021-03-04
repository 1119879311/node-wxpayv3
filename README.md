# wxNodeTs
一个旨在整合微信公众号,微信支付(app支付，扫码支付，公众号和小程序支付)为目的微信工具类(持续更新中...)
主要提供两大类 公众号wxpublic和微信wxpay
######wxpublic类 提供方法
- constructor(config:IwxPublic) 构造函数
参数说明：
	interface IwxPublic {
		appid:string,
		secret:string,
		tokenPath?:string
		ticketPath?:string
	}
- getJsSdk(url:string) 公众号jdk 配置参数

- accessToken() 获取基础accessToken

- codeAccessToken(code:string) 获取网页的accessToken,和用户的openid

- getWxUserInfo(codeAccessToken:string,openid:string) 获取用户的信息

- varyfiyWxchatServer(signature:string,timestamp:string,nonce:string,token:string) 验证微信服务器
参数说明：
     * @param signature  返回的签名 (wxServe 返回的)
     * @param echostr 验证的输出 (wxServe 返回的)
     * @param timestamp  时间戳 (wxServe 返回的)
     * @param nonce  随机数 (wxServe 返回的)
     * @param token : 微信公众号后台设置的token 标识 (开发者自己配置的)

######wxPay微信支付类 提供方法
- constructor(config:IWxPayBase) 构造函数
参数说明：
	interface IWxPayBase{
		appid:string //应用id (注意：不同类型支付，应用id不一样，如微信公众号和小程序)
		mchid:string //商户id
		privatekeyPath:string | Buffer //私钥 可以是私钥地址,可以是Buffer 数据
		publicKeyPath:string  | Buffer //公钥 可以是公钥地址,可以是Buffer 数据
		APIv3key:string //APIv3key
		authType?:string //认证方式:默认WECHATPAY2-SHA256-RSA2048
		serial_no?:string //证书序列号
	}

- getserialNo() 获取证书序列号

- getSign(methond:string,url:string,timestamp:string|number,nonceStr:string,body?:string | object) 获取签名
参数说明：
	 * @param methond 请求类型
	 * @param url 请求地址
	 * @param timestamp  时间戳
	 * @param nonceStr 随机数
	 * @param body 请求报文

- initAuthorization(methond:string,url:string,body?:string | object) 获取微信请求头认证token
参数说明：
	 * @param methond 请求类型
	 * @param url 请求地址
	 * @param body 请求报文

- verifySignature(timestamp:string,Nonce:string,data:string | object,signature:string,Serial:string) 验证签名,使用公钥
参数说明：
	* @param timestamp : 通过HTTP头Wechatpay-Timestamp中的应答时间戳。
	* @param Nonce   通过HTTP头Wechatpay-Nonce中的应答随机串
	* @param data  应答主体（response Body）
	* @param signature  通过HTTP头Wechatpay-Signature传递
	* @param Serial 通过 HTTP头 Wechatpay-Serial

- decryptToJson(nonce: string, associatedData: string, ciphertext: string,apiv3key?:string) 回报文解密
参数说明：
	* @param apiv3key  apiKey3
	* @param nonce  加密使用的随机串初始化向量
	* @param associatedData  附加数据包
	* @param ciphertext   密文



- pay_H5(params:IpayH5parmas)  h5支付，获取H5支付参数
参数说明：
 * @param params IpayH5parmas  h5 下单接口的参数 下单接口返回跳转支付地址 {"h5_url":""}
 * @returns  success {stauts:true,data:{h5_url}}
 * @returns  fail {stauts:false,error}

- pay_JSAPI(params:IPayJSAPIParams) 公众号或者小程序支付,获取支付参数
参数说明：
     * @param params IPayJSAPIParams jspai 下单接口的参数参考：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
     * @returns  success {stauts:true,data:{appId,timeStamp,nonceStr,package,signType,paySign}}
     * @returns  fail {stauts:false,error}

- pay_app(params:IPayAppParams) app 支付，获取支付参数
参数说明：
	* @param params:IPayAppParams  app下单接口参数参考：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_1.shtml
	* @returns  success {stauts:true,data:{appId,partnerid,timeStamp,nonceStr,package,prepayid,sign}}
	* @returns  fail {stauts:false,error}


- pay_native(params:IPayNativeParams) 获取 Native 支付参数
参数说明：
	@param params:IPayNativeParams Native下单接口参数参考 ：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
	@returns  success {stauts:true,data:{code_url}}
	@returns  fail {stauts:false,error}


- query_order(params:Iqueryparmas) 订单号查询或者 商户订单号查询 
参数说明：
 @param params: out_trade_no|transaction_id 

- colse_order(params:Iqueryout_trade_no) 关闭订单
参数说明：
	@param params Iqueryout_trade_no{
		out_trade_no:string
		mchid?:string
	}