//import fastify from "fastify"
//import fastifyWebsocket from "@fastify/websocket"
//import {gameManager} from "./game_manager.js"

import { createServer }           from 'http';
import { WebSocketServer }        from 'ws';
import { gameManager }            from './game_manager.js';
import { startgame, stopgame }    from './gameLoop.js';

const server = createServer()

const wss = new WebSocketServer({server})

let waitingplayer = null

let nextroomID = 1

wss.on('connection', (ws) => {

    if(waitingplayer === null)
    {
        waitingplayer = ws
        ws.send(JSON.stringify({type : 'waiting'}))
    }

    else
    {
        const roomID = nextroomID++
        const room = gameManager.createroom(roomID)

        gameManager.addplayer(roomID,waitingplayer)
        gameManager.addplayer(roomID,ws)

        room.players[0].ws.send(JSON.stringify({type: 'role', side: 'left' }))
        room.players[1].ws.send(JSON.stringify({type: 'role', side: 'right' }))

        waitingplayer = null

        startgame(room)
    }
    ws.on('message', (data) =>{
    
        const msg=JSON.parse(data)
        console.log("Received Key:", msg.key, "Pressed:", msg.pressed);
    
        const room=gameManager.getroombyWS(ws)
        if(!room)
            return
    
        if(msg.type === 'key')
            room.keys[msg.key]=msg.pressed
    });
    
    ws.on('close', () =>{
    
        if(waitingplayer === ws)
        {
            waitingplayer=null
            return
        }
    
        const room =gameManager.getroombyWS(ws)
        if(!room)
            return
    
        stopgame(room)
       
        const opponent = gameManager.getopponent(room, ws)
        if(opponent && opponent.ws.readyState == 1 )
            opponent.ws.send(JSON.stringify({type: 'opponent_disconnected'}))
    
        gameManager.deleteid(room.id)
    });
});

server.listen(3000, () => {
    console.log('server running on port 3000');
});
