import { useState } from "react";

export function useGameState() {
  const [gameStatus, setGameStatus] = useState("connecting");
  const [side, setSide] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [winner, setWinner] = useState(null);

  function handleMessage(msg) {
    switch (msg.type) {
      case "waiting":
        setGameStatus("waiting");
        break;

      case "role":
        setSide(msg.side);
        setGameStatus("waiting");
        break;

      case "countdown":
        setGameStatus("countdown");
        setCountdown(msg.value);
        break;

      case "state":
        setGameStatus("playing");
        setGameState(msg.payload);
        break;

      case "gameover":
        setGameStatus("gameover");
        setWinner(msg.winner);
        break;

      default:
        console.warn("Unknown message:", msg);
    }
  }

  return {
    gameStatus,
    side,
    gameState,
    countdown,
    winner,
    handleMessage,
  };
}