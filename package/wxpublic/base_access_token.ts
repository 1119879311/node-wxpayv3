
// const accessTokenPath = process.cwd()+"/wx_access_token.json";
import * as fs from "fs"
import axios from "axios"
export class BaseAccessToken{
    private appid:string

    private secret:string

    private tokenPath:string = process.cwd()+"/wx_access_token.json"

    constructor(appid:string,secret:string,tokenPath?:string ){
        this.appid = appid
        this.secret = secret
        tokenPath?this.tokenPath = tokenPath:''
    }

    public async get(){
        try {
            // 存储有效时长(自定义) ：110分钟  
            let ATokeCache
            if(fs.existsSync(this.tokenPath)){
                ATokeCache = JSON.parse(fs.readFileSync(this.tokenPath).toString());

            }else{
                 return await this.rqToken();
            }  
            if(!ATokeCache.access_token||ATokeCache.expires_time<new Date().getTime()){
                return await this.rqToken();
            }else{
                return await ATokeCache.access_token;
            }
        } catch (error) {
           throw error;
        }
    }
    //请求wx server 获取token
    private async rqToken(){
      
        try {
            let apiUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`;
            let {data} = await axios.get(apiUrl)
            if(data.access_token){
                this.saveToken(data)
                return await data.access_token;
            }else{
                return await data;
            }
        } catch (error) {
            throw error
        }
    }
    //缓存token
    private saveToken(data:{access_token:string,expires_in:number}){
        let writeResult = {
            access_token:data.access_token,
            expires_time:(new Date().getTime())+(data.expires_in-600)*1000
        }
        fs.writeFile(this.tokenPath,JSON.stringify(writeResult),'utf-8',function(err){
            if(err){console.log(err)}
        });
    }

}