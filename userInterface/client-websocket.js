import PacketManager from "./packet-manager.js";

export default class ClientWebSocket {
    packetManager;

    constructor(dataCallback) {
        this.packetManager = new PacketManager({
            establishConnection : () => new WebSocket("ws://localhost:8080/"),
            mapReactions : new Map([
                ['processed frame', dataCallback]
            ])
        });
    }

    greet() {
        this.packetManager.send(JSON.stringify({type : 'greet', who: 'visitor'}));
    }

    askForFrame () {
        this.packetManager.send(JSON.stringify({type : 'webservice request'}))
    }

    get isAlive() {return this.packetManager.isAlive}
}