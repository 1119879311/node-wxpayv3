interface IwxPublic {
    appid: string;
    secret: string;
    tokenPath?: string;
    ticketPath?: string;
}
export declare class wxPulic {
    private baseAccessToken;
    private jsapiTicket;
    private config;
    constructor(config: IwxPublic);
    /**
     * 获取公众号jdk 配置参数
     * @param url
     */
    getJsSdk(url: string): Promise<{
        appId: string;
        timestamp: number;
        nonceStr: string;
        signature: string;
    }>;
    /**
     * 基础accessToken
     */
    accessToken(): Promise<any>;
    /**
     * 获取网页的 accessToken,openid
     * @param code
     */
    codeAccessToken(code: string): Promise<any>;
    /**
     * 拉取用户信息(需scope为 snsapi_userinfo)
     * @param codeAccessToken :网页code 获取的token
     * @param openid 用户的唯一标识
     */
    getWxUserInfo(codeAccessToken: string, openid: string): Promise<any>;
    /**
     * 验证微信服务器(公众号)
     * @param signature  返回的签名 (wxServe 返回的)
     * @param echostr 验证的输出 (wxServe 返回的)
     * @param timestamp  时间戳 (wxServe 返回的)
     * @param nonce  随机数 (wxServe 返回的)
     * @param token : 微信公众号后台设置的token 标识 (开发者自己配置的)
     */
    static varyfiyWxchatServer(signature: string, timestamp: string, nonce: string, token: string): boolean;
    static create(config: IwxPublic): wxPulic;
}
export {};
