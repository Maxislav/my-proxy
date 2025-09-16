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
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const port = process.env.PORT || 9197;
const net = __importStar(require("net"));
const url = __importStar(require("url"));
const requestHandler = (req, res) => {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
};
const server = http.createServer(requestHandler);
const listener = server.listen(port, () => {
    // if (err) {
    //     return console.error(err)
    // }
    const info = listener.address();
    console.log(`Server is listening on address ${info.address} port ${info.port}`);
});
server.setMaxListeners(20);
server.on('connect', (req, clientSocket, head) => {
    console.log(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url);
    const authHeader = req.headers['proxy-authorization'];
    if (!authHeader) {
        clientSocket.write('HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="proxy"\r\n\r\n');
        clientSocket.end();
        return;
    }
    // 2. Декодируем и проверяем учетные данные
    try {
        const base64String = authHeader.split(' ')[1]; // получаем строку Base64
        const decoded = Buffer.from(base64String, 'base64').toString(); // декодируем Base64
        const [username, password] = decoded.split(':'); // разделяем на имя и пароль
        // Здесь вы добавляете свою логику проверки
        const expectedUsername = 'my';
        const expectedPassword = 'pass';
        if (username !== expectedUsername || password !== expectedPassword) {
            clientSocket.write('HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="proxy"\r\n\r\n');
            clientSocket.end();
            return;
        }
    }
    catch (e) {
        // Обрабатываем ошибки декодирования или некорректного формата
        clientSocket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        clientSocket.end();
        return;
    }
    // if (!req.headers['proxy-authorization']) { // here you can add check for any username/password, I just check that this header must exist!
    //     clientSocket.write([
    //         'HTTP/1.1 407 Proxy Authentication Required',
    //         'Proxy-Authenticate: Basic realm="proxy"',
    //         'Proxy-Connection: close',
    //     ].join('\r\n'))
    //     clientSocket.end('\r\n\r\n')  // empty body
    //     return
    // }
    const { port, hostname } = url.parse(`//${req.url}`, false, true); // extract destination host and port from CONNECT request
    if (hostname && port) {
        const serverErrorHandler = (err) => {
            console.error(err.message);
            if (clientSocket) {
                clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`);
            }
        };
        const serverEndHandler = () => {
            if (clientSocket) {
                clientSocket.end(`HTTP/1.1 500 External Server End\r\n`);
            }
        };
        const serverSocket = net.connect(Number(port), hostname); // connect to destination host and port
        const clientErrorHandler = (err) => {
            console.error(err.message);
            if (serverSocket) {
                serverSocket.end();
            }
        };
        const clientEndHandler = () => {
            if (serverSocket) {
                serverSocket.end();
            }
        };
        clientSocket.on('error', clientErrorHandler);
        //clientSocket.on('end', clientEndHandler)
        clientSocket.once('end', () => {
            // Your logic here
            if (serverSocket) {
                serverSocket.end();
            }
        });
        serverSocket.on('error', serverErrorHandler);
        serverSocket.on('end', serverEndHandler);
        serverSocket.on('connect', () => {
            clientSocket.write([
                'HTTP/1.1 200 Connection Established',
                'Proxy-agent: Node-VPN',
            ].join('\r\n'));
            clientSocket.write('\r\n\r\n'); // empty body
            // "blindly" (for performance) pipe client socket and destination socket between each other
            serverSocket.pipe(clientSocket, { end: false });
            clientSocket.pipe(serverSocket, { end: false });
        });
    }
    else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
        clientSocket.destroy();
    }
});
//# sourceMappingURL=server-net.js.map