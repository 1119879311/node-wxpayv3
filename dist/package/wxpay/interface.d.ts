/// <reference types="node" />
export declare type RequestMethod = "POST" | "GET" | "DELETE" | "ALL" | "PUT" | "HEARD";
declare type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
declare type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export interface IWxPayBase {
    appid: string;
    mchid: string;
    privatekeyPath: string | Buffer;
    publicKeyPath: string | Buffer;
    APIv3key: string;
    authType?: string;
    serial_no?: string;
}
export interface IpayBaseParams {
    appid?: string;
    mchid?: string;
}
interface Iamount {
    total: number;
    currency?: string;
}
interface Igoods_detail {
    merchant_goods_id: string;
    quantity: number;
    unit_price: number;
    wechatpay_goods_id?: string;
    goods_name?: string;
}
interface Idetail {
    cost_price?: number;
    invoice_id?: string;
    goods_detail?: Array<Igoods_detail>;
}
interface Iscene_info {
}
/**
 * h5 支付参数
 */
export interface IpayH5parmas extends IpayBaseParams {
    description: string;
    out_trade_no: string;
    notify_url: string;
    amount: Iamount;
    detail?: Idetail;
    time_expire?: string;
    goods_tag?: string;
    attach?: string;
    scene_info?: Iscene_info;
    [key: string]: any;
}
export interface IPayJSAPIParams extends IpayBaseParams {
    [key: string]: any;
}
export interface IPayAppParams extends IpayBaseParams {
    [key: string]: any;
}
export interface IPayNativeParams extends IpayBaseParams {
    [key: string]: any;
}
export interface IqueryTransaction_id {
    transaction_id: string;
    mchid?: string;
}
export interface Iqueryout_trade_no {
    out_trade_no: string;
    mchid?: string;
}
export declare type Iqueryparmas = XOR<IqueryTransaction_id, Iqueryout_trade_no>;
export {};
