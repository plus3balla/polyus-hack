import deepCopyMap from './deep-copy-map.js';
export default class PacketManager {

    // Wrapper class for websockets
    // Reacts to messages diffirently according to json type and passed reactMessages(Map)

    constructor(args) {
        this.reactToMessages = (event) => {
            var _a;
            let json;
            try {
                json = JSON.parse(event.data);
            }
            catch (e) {
                throw 'Data in bad condition';
            }
            const type = json['type'];
            if (this._mapReactions.get(type) === undefined)
                throw 'Reaction Missing';
            (_a = this._mapReactions.get(type)) === null || _a === void 0 ? void 0 : _a(this, json);
        };
        this._websocket = args.establishConnection();
        this._mapReactions = deepCopyMap(args.mapReactions);
        this._websocket.onmessage = this.reactToMessages;
        if (args.onClose != undefined)
            this._websocket.onclose = args.onClose;
        if (args.onError != undefined)
            this._websocket.onerror = args.onError;
    }
    send(message) { return this._websocket.send(message); }
    close() { this._websocket.close(); }
    ;
    get isAlive() { return this._websocket.readyState === WebSocket.OPEN; }
}
