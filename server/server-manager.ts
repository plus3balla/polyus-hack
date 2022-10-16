import { WebSocketServer } from 'ws';
import convertImages from './image-to-base64.js';
import {JSONTypes, ConnectionTypes} from './some-strings.js';
import {logConnected, logDisconnected, logError} from './console-readability.js';
import {getClassesPercent, getMaxValue} from './compressing-array.js';

function delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface ProcessedResults {
    type : string,
    frame : string,
    rectangles : number[][]
}

//Data
const frameQueue: string[] = []; // Images that needs processing

let processingFrame:string | undefined, // Frame that being send to neural network for processing
    processedResults : ProcessedResults | undefined; // Results from neural network

let translationFinished = false, counter = 0;

const graphResult: number[][] = []; // Compressed response from neural network for frontend statistics

//Timer
const waitFor = 1000; // Waiting time
let timerPased : Promise<any>; // Used for sending request in intervals

//Function

    //managing frameQueue
const queueUp = async () => {

    // Functions adds set new processingFrame from frameQueue
    // Making sure to wait for convertImages
    // Sets translationFinished to True when conversion is over

    counter++;
    while (frameQueue.length === 0 && !translationFinished) await delay(100);
    if (translationFinished && frameQueue.length === 0) return '';
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
const server = new WebSocketServer({
    port: 8080,
});

server.on('connection', function(socket) {

    // Dealing with clients on connection

    let identity:string | null = null; // client's indentity
    
    const identify = (json: { [key: string]: any }) : string => {

        // Identifies connected socket 

        if (json.type !== JSONTypes.greet) 
            throw `Wrong json type. Expected: ${JSONTypes.greet} - Got ${json.type}`;
    
        if (json.who !== ConnectionTypes.visitor && json.who !== ConnectionTypes.neural) 
            throw `Wrong who field. Expected : ${ConnectionTypes.visitor} or ${ConnectionTypes.neural} - Got ${json.who}`
        
        return json.who;
    }

    const isTranlationLive = () => !(frameQueue.length === 0 && translationFinished);

    const handleNeural = async (json: { [key: string]: any }) => {

        // Handles message from Neural Client 

        const askToProcessFrame = async () => {

            // Requst to process frame from Neural Client

            await timerPased;
            socket.send(JSON.stringify({
                type : JSONTypes.processRequest,
                frame : processingFrame
            }))
            timerPased = delay(1000);
        }

        if (json.type === JSONTypes.greet) {
            if (processingFrame === undefined) await queueUp();

            if (!isTranlationLive()) {socket.close(1000, 'Translation finished'); return}

            await askToProcessFrame();
        }
        if (json.type === JSONTypes.processedFrame) {
            processedResults = json as ProcessedResults;

            const max = getMaxValue(processedResults.rectangles);
            const classes = getClassesPercent(processedResults.rectangles);

            graphResult.push([...classes, max])

            await queueUp();
            if (!isTranlationLive()) {socket.close(1000, 'Translation finished'); return}

            await askToProcessFrame();
        }
        if (json.type !== JSONTypes.greet && json.type !== JSONTypes.processedFrame)
            throw `Wrong json type. Expected: ${JSONTypes.greet} or ${JSONTypes.processedFrame}  - Got ${json.type}`
    }
    const handleVisitor = (json: { [key: string]: any }) => {

        // Handle messages from Visitor Client

        if (json.type === JSONTypes.greet) return;

        if (JSONTypes.webserviceRequest) {
            if (!isTranlationLive()) {socket.close(1000, 'Translation finished'); return}

            if (processedResults !== undefined) socket.send(JSON.stringify(
                Object.assign({}, processedResults, {counter, graphResult : graphResult[Math.floor(graphResult.length / 2)]})
                ));
            else {socket.send(JSON.stringify({ type : JSONTypes.processedFrame, counter}))}
        }

        if (json.type !== JSONTypes.greet && json.type !== JSONTypes.webserviceRequest)
            throw `Wrong json type. Expected: ${JSONTypes.greet} or ${JSONTypes.webserviceRequest}  - Got ${json.type}`
    }
    
    socket.on('message', function(msg) {

        // Passes messages to handlers and identifies clients on first contact

        const json = JSON.parse(msg.toString());
        if (identity === null) {
            identity = identify(json);
            logConnected(identity);
        }
        if (identity === ConnectionTypes.visitor) handleVisitor(json);
        if (identity === ConnectionTypes.neural) handleNeural(json);
    });
    socket.onerror = (event) => {
        logError(event.message);
    }

    socket.on('close', () => logDisconnected(identity === null ? '' : identity))
  });




