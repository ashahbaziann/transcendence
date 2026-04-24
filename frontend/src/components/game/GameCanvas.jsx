import { useEffect, useRef } from "react";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_RADIUS,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from "./game.constants";

export default function GameCanvas({ gameState }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(gameState);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function draw() {
      const state = stateRef.current;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (state) {
        // center line
        ctx.strokeStyle = "#333";
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        // ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // left paddle
        ctx.fillStyle = "#3498db";
        ctx.fillRect(20, state.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        // right paddle
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(
          CANVAS_WIDTH - 20 - PADDLE_WIDTH,
          state.right.y,
          PADDLE_WIDTH,
          PADDLE_HEIGHT
        );

        // score
        ctx.fillStyle = "white";
        ctx.font = "30px monospace";
        ctx.fillText(state.left.score, CANVAS_WIDTH / 4, 50);
        ctx.fillText(state.right.score, (CANVAS_WIDTH / 4) * 3, 50);
      }

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
}