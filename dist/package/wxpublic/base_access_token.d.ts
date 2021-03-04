export declare class BaseAccessToken {
    private appid;
    private secret;
    private tokenPath;
    constructor(appid: string, secret: string, tokenPath?: string);
    get(): Promise<any>;
    private rqToken;
    private saveToken;
}
