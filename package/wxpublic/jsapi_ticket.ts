
// let jsapiTicketPath = process.cwd()+"/wx_jsapi_ticket.json";
import * as fs from "fs"
import axios from "axios"
export class JsapiTicket{

    private ticketPath:string = process.cwd()+"/wx_jsapi_ticket.json"

    constructor(ticketPath?:string ){
        
        ticketPath?this.ticketPath = ticketPath:''
    }
    
    public async get(baseAccessToken:string){
        try {
            // 存储有效时长(自定义) ：110分钟  
            let ATokeCache
            if(fs.existsSync(this.ticketPath)){
                ATokeCache = JSON.parse(fs.readFileSync(this.ticketPath).toString());
                
            }else{
                 return await this.rqTicket(baseAccessToken);
            }  
            if(!ATokeCache.ticket||ATokeCache.expires_time<new Date().getTime()){
                return await this.rqTicket(baseAccessToken);
            }else{
                console.log("拿缓存的Ticket")
                return await ATokeCache.ticket;
            }
        } catch (error) {
            console.log(error)
           return await error;
        }
       
    }
    //请求wx server 获取token
    private async rqTicket(baseAccessToken:string){
      
        try {
            let apiUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${baseAccessToken}&type=jsapi`;
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
    private saveToken(data:{ticket:string,expires_in:number}){
        let writeResult = {
            ticket:data.ticket,
            expires_time:(new Date().getTime())+(data.expires_in-600)*1000
        };
        fs.writeFile(this.ticketPath,JSON.stringify(writeResult),'utf-8',function(err){
            if(err){console.log(err)}
        });
    }

}