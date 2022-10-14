import WebSocketModule from 'ws';
import convertImages from './image-to-base64.js';
import {JSONTypes, ConnectionTypes} from './some-strings.js';

function delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface ProcessedResults {
    type : string,
    frame : string,
    rectangles : any[]
}

//Data
const frameQueue: string[] = [];
let processingFrame:string | undefined, processedResults : ProcessedResults | undefined;
let translationFinished = false, counter = 0;

//Function

    //managing frameQueue
const queueUp = async () => {
    counter++;
    while (frameQueue.length === 0 && !translationFinished) await delay(100);
    if (translationFinished) return '';
    processingFrame = frameQueue.shift() as string;
}


    // Start image conversion from file to base64
convertImages({
    left : './images/out',
    right : '.png',
    width: 3,
    callback : (data : string) => frameQueue.push(data),
    onFinish : () => {translationFinished = true}
})

    //server start
const server = new WebSocketModule.Server({
    port: 8080
});

server.on('connection', function(socket) {
    console.log("Got one");
    let identity:string | null = null;
    const identify = (json: { [key: string]: any }) : string => {
        if (json.type !== JSONTypes.greet) 
            throw `Wrong json type. Expected: ${JSONTypes.greet} - Got ${json.type}`;
    
        if (json.who !== ConnectionTypes.visitor && json.who !== ConnectionTypes.neural) 
            throw `Wrong who field. Expected : ${ConnectionTypes.visitor} or ${ConnectionTypes.neural} - Got ${json.who}`
        
        return json.who;
    }

    const isTranlationLive = () => !(frameQueue.length === 0 && translationFinished);

    const handleNeural = async (json: { [key: string]: any }) => {
        const askToProcessFrame = () => {
            socket.send(JSON.stringify({
                type : JSONTypes.processRequest,
                frame : processingFrame
            }))
        }

        if (json.type === JSONTypes.greet) {
            if (processingFrame === undefined) await queueUp();

            if (!isTranlationLive()) {socket.close(1000, 'Translation finished'); return}

            askToProcessFrame();
        }
        if (json.type === JSONTypes.processedFrame) {
            processedResults = json as ProcessedResults;

            await queueUp();
            if (!isTranlationLive()) {socket.close(1000, 'Translation finished'); return}

            askToProcessFrame();
        }
        if (json.type !== JSONTypes.greet && json.type !== JSONTypes.processedFrame)
            throw `Wrong json type. Expected: ${JSONTypes.greet} or ${JSONTypes.processedFrame}  - Got ${json.type}`
    }
    const handleVisitor = (json: { [key: string]: any }) => {
        if (json.type === JSONTypes.greet) return;

        if (JSONTypes.webserviceRequest) {
            if (!isTranlationLive()) {socket.close(1000, 'Translation finished'); return}

            socket.send(JSON.stringify(Object.assign({}, processedResults, {counter})));
        }

        if (json.type !== JSONTypes.greet && json.type !== JSONTypes.webserviceRequest)
            throw `Wrong json type. Expected: ${JSONTypes.greet} or ${JSONTypes.webserviceRequest}  - Got ${json.type}`
    }
    
    socket.on('message', function(msg) {
        const json = JSON.parse(msg.toString());
        if (identity === null) {
            identity = identify(json);
        }
        if (identity === ConnectionTypes.visitor) handleVisitor(json);
        if (identity === ConnectionTypes.neural) handleNeural(json);
    });
  });




