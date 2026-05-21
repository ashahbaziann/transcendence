// import { useEffect, useRef } from "react";
// import {
//   CANVAS_WIDTH,
//   CANVAS_HEIGHT,
//   BALL_RADIUS,
//   PADDLE_WIDTH,
// } from "./game.constants";

// export default function GameCanvas({ gameState, powerUps = [] }) {
//   const canvasRef = useRef(null);
//   const stateRef = useRef(gameState);
//   const powerUpsRef = useRef(powerUps);

//   useEffect(() => { stateRef.current = gameState; }, [gameState]);
//   useEffect(() => { powerUpsRef.current = powerUps; }, [powerUps]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let animationId;

//     function draw() {
//       const state = stateRef.current;
//       const activePowerUps = powerUpsRef.current;

//       ctx.fillStyle = "#111";
//       ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

//       if (!state) {
//         animationId = requestAnimationFrame(draw);
//         return;
//       }

//       // center line
//       ctx.strokeStyle = "#333";
//       ctx.setLineDash([10, 10]);
//       ctx.beginPath();
//       ctx.moveTo(CANVAS_WIDTH / 2, 0);
//       ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
//       ctx.stroke();
//       ctx.setLineDash([]);

//       // ball
//       ctx.fillStyle = "white";
//       ctx.beginPath();
//       ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
//       ctx.fill();

//       // left paddle
//       ctx.fillStyle = "#3498db";
//       ctx.fillRect(20, state.left.y, PADDLE_WIDTH, state.left.height);

//       // right paddle
//       ctx.fillStyle = "#e74c3c";
//       ctx.fillRect(
//         CANVAS_WIDTH - 20 - PADDLE_WIDTH,
//         state.right.y,
//         PADDLE_WIDTH,
//         state.right.height
//       );

//       // power-ups
//       activePowerUps.forEach((pu) => {
//         ctx.fillStyle = "#f1c40f";
//         ctx.beginPath();
//         ctx.arc(pu.x, pu.y, pu.r, 0, Math.PI * 2);
//         ctx.fill();
//       });

//       // scores
//       ctx.fillStyle = "white";
//       ctx.font = "30px monospace";
//       ctx.textAlign = "center";
//       ctx.fillText(state.left.score,  CANVAS_WIDTH / 4,       50);
//       ctx.fillText(state.right.score, (CANVAS_WIDTH / 4) * 3, 50);
//       ctx.textAlign = "start";

//       animationId = requestAnimationFrame(draw);
//     }

//     draw();
//     return () => cancelAnimationFrame(animationId);
//   }, []);

//   return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
// }


import { useEffect, useRef } from 'react';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  BALL_RADIUS, PADDLE_WIDTH,
} from './game.constants';

export default function GameCanvas({ gameState, powerUps = [], bgColor = '#111111' }) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef(gameState);
  const powerUpsRef = useRef(powerUps);
  const bgRef       = useRef(bgColor);

  useEffect(() => { stateRef.current    = gameState; }, [gameState]);
  useEffect(() => { powerUpsRef.current = powerUps;  }, [powerUps]);
  useEffect(() => { bgRef.current       = bgColor;   }, [bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    function draw() {
      const state     = stateRef.current;
      const activePUs = powerUpsRef.current;
      const bg        = bgRef.current;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (!state) {
        animId = requestAnimationFrame(draw);
        return;
      }

      // center dashed line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // left paddle
      ctx.fillStyle = '#1D9E75';
      ctx.beginPath();
      ctx.roundRect(20, state.left.y, PADDLE_WIDTH, state.left.height, 4);
      ctx.fill();

      // right paddle
      ctx.fillStyle = '#E24B4A';
      ctx.beginPath();
      ctx.roundRect(
        CANVAS_WIDTH - 20 - PADDLE_WIDTH,
        state.right.y,
        PADDLE_WIDTH,
        state.right.height,
        4
      );
      ctx.fill();

      // power-ups
      activePUs.forEach((pu) => {
        const colors = {
          speed_up:   '#EF9F27',
          slow_down:  '#378ADD',
          big_paddle: '#D4537E',
        };
        ctx.fillStyle = colors[pu.type] || '#f1c40f';
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, pu.r, 0, Math.PI * 2);
        ctx.fill();
        // small icon letter
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          pu.type === 'speed_up' ? '⚡' : pu.type === 'slow_down' ? '❄' : '↕',
          pu.x, pu.y
        );
        ctx.textBaseline = 'alphabetic';
      });

      // scores
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '700 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.left.score,  CANVAS_WIDTH / 4,       54);
      ctx.fillText(state.right.score, (CANVAS_WIDTH / 4) * 3, 54);
      ctx.textAlign = 'start';

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block', maxWidth: '100%' }}
    />
  );
}