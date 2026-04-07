
import { gameManager }            from './game_manager.js';

const W           = 800;
const H           = 500;
const PADDLE_H    = 90;
const PADDLE_W    = 12;
const LEFT_X      = 20;
const RIGHT_X     = W - 20 - PADDLE_W;   // 768
const BALL_R      = 8;
const PADDLE_SPEED= 5;
const WINNING_SCORE = 5;
const TICK_RATE   = 1000 / 60;

export function startgame(room)
{
    room.interval = setInterval(() =>{
        tick(room);
},TICK_RATE);
}

export function stopgame(room)
{
    clearInterval(room.interval)
    room.interval =null
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
    if(left.y > H - PADDLE_H)
        left.y = H -PADDLE_H
    if(right.y < 0)
        right.y =0
    if(right.y > H - PADDLE_H)
        right.y=H-PADDLE_H
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
        && ball.y < left.y + PADDLE_H)
    {
        ball.x = LEFT_X + PADDLE_W +BALL_R
        ball.vx =-ball.vx
        const hitPos = (ball.y - (left.y + PADDLE_H / 2)) / (PADDLE_H / 2);
        ball.vy =hitPos * 5
        ball.speed = Math.min(ball.speed + 0.3, 12);
        ball.vx    = Math.sign(ball.vx) * ball.speed;
    }

    if(ball.x + BALL_R > RIGHT_X && ball.x < RIGHT_X + PADDLE_W 
        && ball.y > right.y && ball.y < right.y + PADDLE_H
    )
    {
        ball.x = RIGHT_X - BALL_R
        ball.vx=-ball.vx
        const hitPos = (ball.y - (right.y + PADDLE_H / 2)) / (PADDLE_H / 2);
        ball.vy =hitPos * 5
        ball.speed = Math.min(ball.speed + 0.3, 12);
        ball.vx    = Math.sign(ball.vx) * ball.speed;
    }

}
function restartball(room,direction)
{
    const ball =room.gameState.ball

    ball.x = W/2
    ball.y = H/2
    ball.speed=4
    ball.vx=ball.speed * direction
    ball.vy =3
}

function checkScoring(room)
{
    const ball =room.gameState.ball
    const left = room.gameState.left
    const right =room.gameState.right

    if(ball.x < 0)
    {
        right.score+=1
        if(right.score === WINNING_SCORE)
            room.status = "gameover"
        else
            restartball(room,+1)
    }

    else if(ball.x > W)
    {
        left.score+=1
        if(left.score === WINNING_SCORE)
           room.status = "gameover"
        else
            restartball(room,-1)
    }
}
function broadcaststate(room)
{
    const msg =JSON.stringify({
        type: 'state',
        payload: room.gameState
    });

    for(const player of room.players)
    {
        if(player.ws.readyState == 1)
            player.ws.send(msg)
    }
}

function tick(room)
{
    if (room.status !== 'playing') return;
     movePaddles(room)
     moveBall(room)
     checkWallCollision(room)
     paddlecollision(room)
     checkScoring(room)
     broadcaststate(room)
     
}