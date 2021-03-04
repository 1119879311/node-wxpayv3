/// <reference types="node" />
import * as crypto from "crypto";
export declare const getRandom: (len?: number) => string;
export declare const getTimestamp: () => number;
export declare const getToMoney: (money: number) => number;
/**
 * md5 加密
 * @param str
 * @param encodeing
 */
export declare const md5: (str: string, encodeing?: crypto.Encoding) => string;
/**
 * sha1 加密
 * @param str
 * @param encodeing
 */
export declare const sha1: (str: string, encodeing?: crypto.Encoding) => string;
/**
 * sha256 加密
 * @param str
 * @param key
 * @param encodeing
 */
export declare const sha256: (str: string, key: crypto.KeyObject, encodeing?: crypto.Encoding) => void;
/**
 * RSA-SHA256 加密
 * @param data
 * @param key
 */
export declare const SHA256RSA: (data: string, key: Buffer) => string;
export declare const sha256RsaVerify: (publicKey: Buffer, signature: string, data: string) => boolean;
/**
  * AEAD_AES_256_GCM 解密
  * @param key  apiKey3
  * @param nonce  加密使用的随机串初始化向量
  * @param associatedData  附加数据包
  * @param ciphertext   密文
  */
export declare const Aes256GcmDecrypt: (key: string, nonce: string, associatedData: string, ciphertext: string) => string;
export declare function getQueryString<T extends object>(data: T): string;
/**
 * 检查是否xml
 * @param str
 */
export declare function checkXml(str: string): boolean;
/**
 * 对象转xml
 * @param data
 * @param rootName
 */
export declare function buildXml<T extends object>(data: T, rootName?: string): string;
export declare function parseXml(data: string): Promise<any>;
