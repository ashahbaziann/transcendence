const W = 800;
const H = 500;
const PADDLE_H = 90;

export const gameManager={
    rooms: new Map(),

    createroom(roomid)
    {
        const newroom=
        {
            id: roomid,
            players: [],
            time: new Date(),
            status: 'waiting',  // 'waiting' | 'playing' | 'gameover'
            // Game state — think of this as a struct inside your room struct
            gameState: {
                ball: { x: W / 2, y: H / 2,vx: 4, vy: 3,speed: 4},
                left:  { y: H / 2 - PADDLE_H / 2,score: 0},
                right: {y: H / 2 - PADDLE_H / 2,score: 0},
            },
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

        room.gameState.ball.x =W / 2
        room.gameState.ball.y =H / 2
        room.gameState.ball.vx =4
        room.gameState.ball.vy =3
        room.gameState.ball.speed =4

        room.gameState.left.y=H / 2 - PADDLE_H / 2
        room.gameState.left.score=0
        room.gameState.left.upKey=false
        room.gameState.left.downKey=false

        room.gameState.right.y=H / 2 - PADDLE_H / 2
        room.gameState.right.score=0
        room.gameState.right.upKey=false
        room.gameState.right.downKey=false


        room.status = 'waiting'
        room.time = new Date()

        return room

    }
};