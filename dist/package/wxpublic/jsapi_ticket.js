"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsapiTicket = void 0;
// let jsapiTicketPath = process.cwd()+"/wx_jsapi_ticket.json";
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
class JsapiTicket {
    constructor(ticketPath) {
        this.ticketPath = process.cwd() + "/wx_jsapi_ticket.json";
        ticketPath ? this.ticketPath = ticketPath : '';
    }
    get(baseAccessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 存储有效时长(自定义) ：110分钟  
                let ATokeCache;
                if (fs.existsSync(this.ticketPath)) {
                    ATokeCache = JSON.parse(fs.readFileSync(this.ticketPath).toString());
                }
                else {
                    return yield this.rqTicket(baseAccessToken);
                }
                if (!ATokeCache.ticket || ATokeCache.expires_time < new Date().getTime()) {
                    return yield this.rqTicket(baseAccessToken);
                }
                else {
                    console.log("拿缓存的Ticket");
                    return yield ATokeCache.ticket;
                }
            }
            catch (error) {
                console.log(error);
                return yield error;
            }
        });
    }
    //请求wx server 获取token
    rqTicket(baseAccessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let apiUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${baseAccessToken}&type=jsapi`;
                let { data } = yield axios_1.default.get(apiUrl);
                if (data.access_token) {
                    this.saveToken(data);
                    return yield data.access_token;
                }
                else {
                    return yield data;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    //缓存token
    saveToken(data) {
        let writeResult = {
            ticket: data.ticket,
            expires_time: (new Date().getTime()) + (data.expires_in - 600) * 1000
        };
        fs.writeFile(this.ticketPath, JSON.stringify(writeResult), 'utf-8', function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
}
exports.JsapiTicket = JsapiTicket;
