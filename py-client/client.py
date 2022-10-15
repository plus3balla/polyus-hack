import asyncio
import json
from websockets import connect

greet = {
    "type" : "greet",
    "who" : "neural" 
}


def neuralNetworkSimulate(json) :
    json["checked"] = True
    json["type"] = "processed frame";
    return json


async def handle(uri):
    async with connect(uri) as websocket:
        await websocket.send(json.dumps(greet))

        count = 0;

        while (True):
            count += 1

            response = neuralNetworkSimulate(json.loads(await websocket.recv()))
            print(str(count) + "message exchanged")
            await websocket.send(json.dumps(response));



asyncio.run(handle("ws://localhost:8080"))