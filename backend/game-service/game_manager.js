const W = 800;
const H = 500;
const PADDLE_H = 90;

export const gameManager={
    rooms: new Map(),

    createroom(roomid,settings = {})
    {
        const speedmultiplier =settings.ballspeed || 1
        const paddleSize = settings.paddleSize || PADDLE_H
        const newroom=
        {
            id: roomid,
            players: [],
            time: new Date(),
            status: 'waiting',  // 'waiting' | 'playing' | 'gameover'
            // Game state — think of this as a struct inside your room struct
            gameState: {
                ball: { x: W / 2, y: H / 2,
                    vx: 4 * speedmultiplier, 
                    vy: 3 * speedmultiplier,
                    speed: 4 * speedmultiplier},
                left:  { y: H / 2 - paddleSize/ 2,score: 0,height: paddleSize},
                right: {y: H / 2 - paddleSize / 2,score: 0,height:paddleSize},
            },
             settings: {
                speedmultiplier,
                paddleSize:   paddleSize,
                winningScore: settings.winningScore || 5,
                map:          settings.map          || 'classic',
                powerUps:     settings.powerUps     || false
            },
            powerUps: [],
            keys: {
            w:         false,
            s:         false,
            ArrowUp:   false,
            ArrowDown: false
        },
        };

        this.rooms.set(roomid,newroom);
        return newroom;
    },

    getid(roomid)
    {
        return this.rooms.get(roomid);
    },

    deleteid(roomid)
    {
        return this.rooms.delete(roomid);
    },


    addplayer(roomid,ws)
    {
        const room = this.rooms.get(roomid)
        if(!room)
            return null

        const side = room.players.length === 0? "left" : "right"
        const player = {ws , side}

        room.players.push(player)

        if(room.players.length === 2)
            room.status = "playing"

        return player
    },

    getroombyWS(ws)
    {
        for(const room of this.rooms.values())
            for(const player of room.players)
                if(player.ws === ws)
                    return room

        return null
    },

    getopponent(room, ws)
    {
        return room.players.find(p => p.ws!==ws) || null
    },

    isFull(roomId)
    {
        const room = this.rooms.get(roomId)
        if(!room)
         return null

        if(room.players.length === 2)
            return true

        return false
    },

    resetGameState(roomId)
    {
        const room = this.rooms.get(roomId)
        if(!room)
            return null
        const setin = room.settings

        room.gameState.ball.x =W / 2
        room.gameState.ball.y =H / 2
        room.gameState.ball.vx =4 * setin.speedmultiplier
        room.gameState.ball.vy =3 * setin.speedmultiplier
        room.gameState.ball.speed =4 * setin.speedmultiplier

        room.gameState.left.y=H / 2 - setin.paddleSize/ 2
        room.gameState.left.score=0
        room.gameState.left.height=setin.paddleSize
        
        room.gameState.right.y=H / 2 - setin.paddleSize/ 2
        room.gameState.right.score=0
        room.gameState.right.height=setin.paddleSize
        
        room.status = 'waiting'
        room.time = new Date()
        room.powerUps = []

        return room

    }
};