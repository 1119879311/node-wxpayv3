import * as crypto from "crypto"
import * as xml2js from "xml2js"
// 生成随机数据
export const getRandom = (len:number=16)=>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let res = '',maxLen = chars.length;
    while(len--){
        res+=chars[Math.floor(Math.random() * maxLen)]
    } 
    return res
}

// 生成时间戳
export const getTimestamp = ()=>{
    return new Date().getTime()
}
//钱转分
export const getToMoney = (money:number)=>{
    return money * 100;
}
/**
 * md5 加密
 * @param str 
 * @param encodeing 
 */
export const md5 = (str:string,encodeing:crypto.Encoding='utf-8')=>{
    return crypto.createHash('md5').update(str, encodeing).digest('hex')
}
/**
 * sha1 加密
 * @param str 
 * @param encodeing 
 */
export const sha1 = (str:string,encodeing:crypto.Encoding='utf-8')=>{
    return crypto.createHash("sha1").update(str,encodeing).digest('hex');
}

/**
 * sha256 加密
 * @param str 
 * @param key 
 * @param encodeing 
 */
export const sha256 = (str:string,key:crypto.KeyObject,encodeing:crypto.Encoding='utf-8')=>{
    crypto.createHmac('sha256', key).update(str, encodeing).digest('hex');
}

/**
 * RSA-SHA256 加密
 * @param data 
 * @param key 
 */
export const SHA256RSA = (data:string,key:Buffer)=>{
    return crypto.createSign('RSA-SHA256').update(data).sign(key, 'base64');
}

export const sha256RsaVerify = (publicKey: Buffer, signature: string, data: string)=> {
    return crypto
      .createVerify('RSA-SHA256')
      .update(data)
      .verify(publicKey, signature, 'base64')
  }


 /**
   * AEAD_AES_256_GCM 解密
   * @param key  apiKey3
   * @param nonce  加密使用的随机串初始化向量
   * @param associatedData  附加数据包
   * @param ciphertext   密文
   */
export const Aes256GcmDecrypt = (key: string, nonce: string, associatedData: string, ciphertext: string)=>{
    let ciphertextBuffer = Buffer.from(ciphertext, 'base64')
    let authTag = ciphertextBuffer.slice(ciphertextBuffer.length - 16)
    let data = ciphertextBuffer.slice(0, ciphertextBuffer.length - 16)
    let decipherIv = crypto.createDecipheriv('aes-256-gcm', key, nonce)
    decipherIv.setAuthTag(Buffer.from(authTag))
    decipherIv.setAAD(Buffer.from(associatedData))
    let decryptStr = decipherIv.update(data, undefined, 'utf8')
    decipherIv.final()
    return decryptStr
}


//按照字段名的ASCII 码从小到大排序
export function getQueryString <T extends object>(data:T):string{
    let keys = Object.keys(data)
    let newKeys = keys.sort()
    let singArr:Array<string> = []
    for(let i =0;i<newKeys.length;i++){
        let dataKey:keyof T = newKeys[i] as any
        singArr.push(dataKey+'='+data[dataKey])
    }
    let sinStr =singArr.join("&")

    return sinStr

}
/**
 * 检查是否xml
 * @param str 
 */
export function checkXml(str:string){
    let reg = /^(<\?xml.*\?>)?(\r?\n)*<xml>(.|\r?\n)*<\/xml>$/i;
    return reg.test(str.trim());
}

/**
 * 对象转xml
 * @param data 
 * @param rootName 
 */
export function buildXml<T extends object>(data:T,rootName="xml"){
    let options:xml2js.BuilderOptions = { rootName, allowSurrogateChars: true, cdata: true,headless:true}
    return new xml2js.Builder(options).buildObject(data)
}

//xml 转json
export function parseXml(data:string){
    let options:xml2js.ParserOptions = {trim: true, explicitArray: false, explicitRoot: false}
    return  xml2js.parseStringPromise(data,options)
    // return new Promise((resolve,reject)=>{
    //     let options:xml2js.ParserOptions
    //     return  xml2js.parseString(data,options,err, res) => err ? reject(new Error('xmlError')) : resolve(res || {}))
    // })
}


