import asyncio
import json
from websockets import connect

from main import get_bboxes


greet = {
    "type" : "greet",
    "who" : "neural" 
}



def neuralNetwork(json):
    response = get_bboxes(json['frame'])
    json["type"] = "processed frame";
    json['rectangles'] = response;
    return json
    


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

            response = neuralNetwork(json.loads(await websocket.recv()))
            print(response)
            print(str(count) + "message exchanged")
            await websocket.send(json.dumps(response));



asyncio.run(handle("ws://localhost:8080"))