//import fastify from "fastify"
//import fastifyWebsocket from "@fastify/websocket"
//import {gameManager} from "./game_manager.js"


import { createServer }           from 'http';
import { WebSocketServer }        from 'ws';
import { gameManager }            from './game_manager.js';
import { startgame, stopgame }    from './gameLoop.js';
import { validateToken}           from './auth.js';
const server = createServer()

const wss = new WebSocketServer({server})

let waitingplayer = null

let nextroomID = 1

wss.on('connection', async(ws,req) => {

    const params = new URL(req.url, 'http://localhost').searchParams;
    const token  = params.get('token');
    
    const user = await validateToken(token);
    
    if (!user) {
        ws.send(JSON.stringify({
            type:    'error',
            message: 'not authenticated'
        }));
        ws.close(); 
        return;     
    }

    ws.userId   = user.id;    
    ws.username = user.username;
    if(waitingplayer === null)
    {
        waitingplayer = ws
        ws.settings = {}
        ws.send(JSON.stringify({type : 'waiting'}))
    }

    else
    {
        const roomID = nextroomID++
        const room = gameManager.createroom(roomID, waitingplayer.settings || {});

        gameManager.addplayer(roomID,waitingplayer)
        gameManager.addplayer(roomID,ws)

        room.players[0].ws.send(JSON.stringify({type: 'role', side: 'left' }))
        room.players[1].ws.send(JSON.stringify({type: 'role', side: 'right' }))

        const settingsMsg = JSON.stringify({
         type:     'settings',
        settings: room.settings
        });
        room.players[0].ws.send(settingsMsg);
        room.players[1].ws.send(settingsMsg);
        waitingplayer = null
        startgame(room)
        }

    ws.on('message', (data) =>{
    
        const msg=JSON.parse(data)
        console.log("Received Key:", msg.key, "Pressed:", msg.pressed);
    
        const room=gameManager.getroombyWS(ws)
        if (msg.type === 'settings' && !room) {
            ws.settings = {
            ballSpeed:    msg.ballSpeed,
            paddleSize:   msg.paddleSize,
            winningScore: msg.winningScore,
            map:          msg.map,
            powerUps:     msg.powerUps
        };
        return;
    }
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
