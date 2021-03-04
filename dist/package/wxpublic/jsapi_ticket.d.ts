export declare class JsapiTicket {
    private ticketPath;
    constructor(ticketPath?: string);
    get(baseAccessToken: string): Promise<any>;
    private rqTicket;
    private saveToken;
}
