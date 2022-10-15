import { WebSocketServer } from 'ws';
import convertImages from './image-to-base64.js';
import { JSONTypes, ConnectionTypes } from './some-strings.js';
import { logConnected, logDisconnected, logError } from './console-readability.js';
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//Data
const frameQueue = [];
let processingFrame, processedResults;
let translationFinished = false, counter = 0;
//Timer
const waitFor = 1000;
let timerPased;
//Function
//managing frameQueue
const queueUp = async () => {
    counter++;
    while (frameQueue.length === 0 && !translationFinished)
        await delay(100);
    if (translationFinished && frameQueue.length === 0)
        return '';
    processingFrame = frameQueue.shift();
};
// Start image conversion from file to base64
convertImages({
    left: './images/out',
    right: '.png',
    width: 3,
    callback: (data) => frameQueue.push(data),
    onFinish: () => { translationFinished = true; }
});
//server start
const server = new WebSocketServer({
    port: 8080
});
server.on('connection', function (socket) {
    let identity = null;
    const identify = (json) => {
        if (json.type !== JSONTypes.greet)
            throw `Wrong json type. Expected: ${JSONTypes.greet} - Got ${json.type}`;
        if (json.who !== ConnectionTypes.visitor && json.who !== ConnectionTypes.neural)
            throw `Wrong who field. Expected : ${ConnectionTypes.visitor} or ${ConnectionTypes.neural} - Got ${json.who}`;
        return json.who;
    };
    const isTranlationLive = () => !(frameQueue.length === 0 && translationFinished);
    const handleNeural = async (json) => {
        const askToProcessFrame = async () => {
            await timerPased;
            socket.send(JSON.stringify({
                type: JSONTypes.processRequest,
                frame: processingFrame
            }));
            timerPased = delay(1000);
        };
        if (json.type === JSONTypes.greet) {
            if (processingFrame === undefined)
                await queueUp();
            if (!isTranlationLive()) {
                socket.close(1000, 'Translation finished');
                return;
            }
            await askToProcessFrame();
        }
        if (json.type === JSONTypes.processedFrame) {
            processedResults = json;
            await queueUp();
            if (!isTranlationLive()) {
                socket.close(1000, 'Translation finished');
                return;
            }
            await askToProcessFrame();
        }
        if (json.type !== JSONTypes.greet && json.type !== JSONTypes.processedFrame)
            throw `Wrong json type. Expected: ${JSONTypes.greet} or ${JSONTypes.processedFrame}  - Got ${json.type}`;
    };
    const handleVisitor = (json) => {
        if (json.type === JSONTypes.greet)
            return;
        if (JSONTypes.webserviceRequest) {
            if (!isTranlationLive()) {
                socket.close(1000, 'Translation finished');
                return;
            }
            if (processedResults !== undefined)
                socket.send(JSON.stringify(Object.assign({}, processedResults, { counter })));
            else {
                socket.send(JSON.stringify({ type: JSONTypes.processedFrame, counter }));
            }
        }
        if (json.type !== JSONTypes.greet && json.type !== JSONTypes.webserviceRequest)
            throw `Wrong json type. Expected: ${JSONTypes.greet} or ${JSONTypes.webserviceRequest}  - Got ${json.type}`;
    };
    socket.on('message', function (msg) {
        const json = JSON.parse(msg.toString());
        if (identity === null) {
            identity = identify(json);
            logConnected(identity);
        }
        if (identity === ConnectionTypes.visitor)
            handleVisitor(json);
        if (identity === ConnectionTypes.neural)
            handleNeural(json);
    });
    socket.onerror = (event) => {
        logError(event.message);
    };
    socket.on('close', () => logDisconnected(identity === null ? '' : identity));
});
