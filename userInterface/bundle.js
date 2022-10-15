import ClientWebSocket from "./client-websocket.js";

const websocket = new ClientWebSocket((inst, data) => console.log(data))

function startReceivingData() {

    if (!websocket.isAlive) {
        setTimeout(startReceivingData, 100);
        return;
    }

    websocket.greet();
    console.log('greeted')
    
    websocket.askForFrame();

    setInterval(() => websocket.askForFrame(), 1000);
}

startReceivingData();