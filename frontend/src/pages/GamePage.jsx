import { useEffect } from "react";

import GameCanvas from "../components/game/GameCanvas";
import GameHUD from "../components/game/GameHUD";
import { useGameState } from "../components/game/useGameState";
import { useGameSocket } from "../components/game/useGameSocket";
import { useGameInput } from "../components/game/useGameInput";

const USE_MOCK = false;

/* ---------------- MOCK SOCKET ---------------- */
function useMockSocket(onMessage) {
  useEffect(() => {
    console.log("MOCK SERVER STARTED");

    // waiting
    setTimeout(() => {
      onMessage({ type: "waiting" });
    }, 500);

    // role
    setTimeout(() => {
      onMessage({ type: "role", side: "left" });
    }, 1500);

    // countdown
    let count = 3;

    const countdownInterval = setInterval(() => {
      if (count > 0) {
        onMessage({ type: "countdown", value: count });
        count--;
      } else {
        clearInterval(countdownInterval);
        startGameLoop();
      }
    }, 1000);

    function startGameLoop() {
      let ball = { x: 400, y: 250, vx: 3, vy: 2 };
      let left = { y: 200, score: 0 };
      let right = { y: 200, score: 0 };

      setInterval(() => {
        // physics
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y <= 0 || ball.y >= 500) {
          ball.vy *= -1;
        }

        // right score
        if (ball.x < 0) {
          right.score++;
          ball = { x: 400, y: 250, vx: 3, vy: 2 };
        }

        // left score
        if (ball.x > 800) {
          left.score++;
          ball = { x: 400, y: 250, vx: -3, vy: 2 };
        }

        onMessage({
          type: "state",
          payload: { ball, left, right },
        });

        // game over
        if (left.score === 5 || right.score === 5) {
          onMessage({
            type: "gameover",
            winner: left.score > right.score ? "left" : "right",
          });
        }
      }, 1000 / 60);
    }
  }, [onMessage]);
}

/* ---------------- GAME PAGE ---------------- */
export default function GamePage() {
  const {
    gameStatus,
    side,
    gameState,
    countdown,
    winner,
    handleMessage,
  } = useGameState();

  // ALWAYS define send safely
  let send = () => {};

  // choose mock or real socket
  if (USE_MOCK) {
    useMockSocket(handleMessage);
  } else {
    const socket = useGameSocket(handleMessage);
    send = socket.send;
  }

  // input system (only active in gameplay)
  useGameInput({ send }, gameStatus === "playing");

  return (
    <div style={{ background: "#111", height: "100vh" }}>
      <GameHUD
        status={gameStatus}
        side={side}
        countdown={countdown}
        winner={winner}
      />

      <GameCanvas gameState={gameState} />
    </div>
  );
}