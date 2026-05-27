import { gameManager }            from './game_manager.js';
import { saveMatchResult } from './auth.js';

const W           = 800;
const H           = 500;
const PADDLE_H    = 90;
const PADDLE_W    = 12;
const LEFT_X      = 20;
const RIGHT_X     = W - 20 - PADDLE_W;   
const BALL_R      = 8;
const PADDLE_SPEED= 5;
const WINNING_SCORE = 5;
const TICK_RATE   = 1000 / 60;
const POWERUP_TYPES = ['speed_up', 'slow_down', 'big_paddle'];


async function tickLoop(room) {
    if (room.status === 'gameover' || room.status === 'stopped') return;
    await tick(room);
    if (room.status === 'gameover' || room.status === 'stopped') return;
    room.interval = setTimeout(() => tickLoop(room), TICK_RATE);
}

export function startgame(room) {
    room.interval = setTimeout(() => tickLoop(room), TICK_RATE);
}

export function stopgame(room) {
    clearTimeout(room.interval);
    room.interval = null;
    room.status   = 'stopped';
}



function movePaddles(room)
{
    const left = room.gameState.left
    const right = room.gameState.right
    const key =room.keys

    if(key.w == true)
        left.y-=PADDLE_SPEED 
    if(key.s == true)
        left.y+=PADDLE_SPEED
    if(key.ArrowUp == true)
         right.y-=PADDLE_SPEED 
    if(key.ArrowDown == true)
         right.y+=PADDLE_SPEED
        
    if(left.y < 0 )
        left.y =0
    if(left.y > H - left.height)
        left.y = H -left.height
    if(right.y < 0)
        right.y =0
    if(right.y > H - right.height)
        right.y=H-right.height
}
function moveBall(room)
{
    room.gameState.ball.x+=room.gameState.ball.vx
    room.gameState.ball.y+=room.gameState.ball.vy
}
function checkWallCollision(room)
{
    const ball = room.gameState.ball

    if(ball.y - BALL_R < 0)
    {
        ball.y=BALL_R 
        ball.vy=-ball.vy
    }
    else if(ball.y + BALL_R > H)
    {
        ball.y=H - BALL_R
        ball.vy=-ball.vy
    }
}

function paddlecollision(room)
{
    const ball = room.gameState.ball
    const left = room.gameState.left
    const right =room.gameState.right

    if(ball.x -BALL_R < LEFT_X +PADDLE_W && ball.x > LEFT_X 
        && ball.y > left.y 
        && ball.y < left.y + left.height)
    {
        ball.x = LEFT_X + PADDLE_W +BALL_R
        ball.vx =-ball.vx
        const hitPos = (ball.y - (left.y + left.height / 2)) / (left.height / 2);
        ball.vy =hitPos * 5
        ball.speed = Math.min(ball.speed + 0.3, 12);
        ball.vx    = Math.sign(ball.vx) * ball.speed;
    }

    if(ball.x + BALL_R > RIGHT_X && ball.x < RIGHT_X + PADDLE_W 
        && ball.y > right.y && ball.y < right.y + right.height
    )
    {
        ball.x = RIGHT_X - BALL_R
        ball.vx=-ball.vx
        const hitPos = (ball.y - (right.y + right.height / 2)) / (right.height / 2);
        ball.vy =hitPos * 5
        ball.speed = Math.min(ball.speed + 0.3, 12);
        ball.vx    = Math.sign(ball.vx) * ball.speed;
    }

}
function restartball(room,direction)
{
    const ball =room.gameState.ball
    const speedmultiplier =room.settings.speedmultiplier

    ball.x = W/2
    ball.y = H/2
    ball.speed=4 * speedmultiplier
    ball.vx=ball.speed * direction
    ball.vy =3 * speedmultiplier
}

function broadcastGameOver(room, winner) {
    const msg = JSON.stringify({
        type:   'gameover',
        winner: winner,
        scores: {
            left:  room.gameState.left.score,
            right: room.gameState.right.score
        }
    });

    for (const player of room.players) {
        if (player.ws.readyState === 1)
            player.ws.send(msg);
    }
}

async function checkScoring(room)
{
    const ball =room.gameState.ball
    const left = room.gameState.left
    const right =room.gameState.right

    if(ball.x < 0)
    {
        right.score+=1
        if (right.score === room.settings.winningScore) {
            room.status = 'gameover';
            stopgame(room);
            broadcastGameOver(room, 'right');
            await saveMatchResult({
                winnerId:    room.players[1].ws.userId,
                loserId:     room.players[0].ws.userId,
                winnerScore: right.score,
                loserScore:  left.score,
                duration:    Date.now() - room.time,
            }).catch(console.error);
        } 
         else
            restartball(room,+1)
        return;
    }

    if(ball.x > W)
    {
        left.score+=1

        if (left.score === room.settings.winningScore) {
            room.status = 'gameover';
            stopgame(room);
            broadcastGameOver(room, 'left');
            await saveMatchResult({
                winnerId:    room.players[0].ws.userId,
                loserId:     room.players[1].ws.userId,
                winnerScore: left.score,
                loserScore:  right.score,
                duration:    Date.now() - room.time,
            }).catch(console.error);
        }
        else
            restartball(room,-1)

    }
}

function spawnPowerUp(room) {
    if (!room.settings.powerUps)   return;
    if (room.powerUps.length >= 2) return;
    if (Math.random() > 0.005)     return;

    room.powerUps.push({
        id:   Date.now(),
        type: POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)],
        x:    W * 0.25 + Math.random() * W * 0.5,
        y:    50 + Math.random() * (H - 100),
        r:    14
    });
}

function applypowerup(room,type)
{
    const ball = room.gameState.ball

    switch(type)
    {
        case('speed_up'):
        {
            ball.speed = Math.min(ball.speed + 2,14)
            ball.vx = Math.sign(ball.vx) *ball.speed
            break;
        }

        case('slow_down'):
        {
            ball.speed = Math.max(ball.speed - 2,2)
            ball.vx = Math.sign(ball.vx) *ball.speed
            break;
        }

        case('big_paddle'):
        {
            room.gameState.left.height +=30
            room.gameState.right.height+=30

            setTimeout(()=>{
            if (room.status === 'gameover' || room.status === 'stopped') return; 
            room.gameState.left.height -=30
            room.gameState.right.height-=30
            },5000);
            break;
        }
    }
}

function checkPowerUps(room)
{
    const ball =room.gameState.ball

    if(!room.settings.powerUps) return;

    room.powerUps=room.powerUps.filter(pu =>{
        const dx = ball.x - pu.x
        const dy = ball.y - pu.y
        const dist = Math.sqrt((dx * dx) + (dy * dy));

        if(dist < BALL_R + pu.r)
        {
            applypowerup(room,pu.type)
            return false 
        }

        return true 
    })
}
function broadcaststate(room)
{
    const msg =JSON.stringify({
        type:     'state',
        payload:  room.gameState,     
        powerUps: room.powerUps,   
    });

    for(const player of room.players)
    {
        if(player.ws.readyState == 1)
            player.ws.send(msg)
    }
}

async function tick(room)
{
    if (room.status !== 'playing') return;
     movePaddles(room)
     moveBall(room)
     checkWallCollision(room)
     paddlecollision(room)
     await checkScoring(room)
     if (room.status !== 'playing') return; 
     spawnPowerUp(room);
     checkPowerUps(room);
     broadcaststate(room);  
}