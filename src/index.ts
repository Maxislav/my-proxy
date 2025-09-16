import express from 'express'

import * as http from 'http';
const server = express();
const PORT = 9999;


export const proxyOpenRain = (req: any, res: any) => {
     console.log(req.url)
    const options = {
        port: 80,
        host: req.hostname,
        path: req.path
    };
    const proxyRequest = http.request(options);
    const chunks: Array<any> = [];
    proxyRequest.on('response', function (proxyResponse) {
        proxyResponse.on('data', function (chunk: Buffer) {
            chunks.push(chunk)
        });
        proxyResponse.on('end', function () {
            res.set(proxyResponse.headers)
            res.send(Buffer.concat(chunks))
        });
    });
    proxyRequest.on('error', function (err) {
        console.error('proxyOpenRain history err3 ->', err);
        res.send(err)
    });
    req.on('data', function (chunk) {
        proxyRequest.write(chunk);
    });
    req.on('end', function () {
        proxyRequest.end();
    });
};
//  http://meteo-info.kiev.ua/#/radar
// server.get('/', (req, res) => {
//     console.log(req.host)
//         res.send('Ololo')
//     }
// )
 //server.get('*', proxyOpenRain)

server.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
import './server-net'