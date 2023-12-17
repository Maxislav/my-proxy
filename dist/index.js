"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyOpenRain = void 0;
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const server = (0, express_1.default)();
const PORT = 9999;
const proxyOpenRain = (req, res) => {
    console.log(req.url);
    const options = {
        port: 80,
        host: req.hostname,
        path: req.path
    };
    const proxyRequest = http.request(options);
    const chunks = [];
    proxyRequest.on('response', function (proxyResponse) {
        proxyResponse.on('data', function (chunk) {
            chunks.push(chunk);
        });
        proxyResponse.on('end', function () {
            res.set(proxyResponse.headers);
            res.send(Buffer.concat(chunks));
        });
    });
    proxyRequest.on('error', function (err) {
        console.error('proxyOpenRain history err3 ->', err);
        res.send(err);
    });
    req.on('data', function (chunk) {
        proxyRequest.write(chunk);
    });
    req.on('end', function () {
        proxyRequest.end();
    });
};
exports.proxyOpenRain = proxyOpenRain;
//  http://meteo-info.kiev.ua/#/radar
// server.get('/', (req, res) => {
//     console.log(req.host)
//         res.send('Ololo')
//     }
// )
server.get('*', exports.proxyOpenRain);
server.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
require("./server-net");
//# sourceMappingURL=index.js.map