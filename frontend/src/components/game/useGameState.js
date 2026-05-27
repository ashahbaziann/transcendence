import { useState, useCallback } from "react";

function handleSharedMessage(msg, setGameStatus, setError, setSettings, setCountdown, setGameState, setPowerUps, setWinner) {
  switch (msg.type) {
    case "waiting":
      setError(null);
      setGameStatus("waiting");
      break;

    case "settings":
      setSettings(msg.settings);
      break;

    case "countdown":
      setError(null);
      setGameStatus("countdown");
      setCountdown(msg.value);
      break;

    case "state":
      setError(null);
      setGameStatus("playing");
      setGameState(msg.payload);
      setPowerUps(msg.powerUps || []);
      break;

    case "gameover":
      setGameStatus("gameover");
      setWinner(msg.winner);
      break;

    case "opponent_disconnected":
      setGameStatus("disconnected");
      setError("Opponent disconnected.");
      break;

    case "disconnected":
      setGameStatus((current) =>
        current === "gameover" ? current : "disconnected"
      );
      break;

    case "error":
      setGameStatus("error");
      setError(msg.message || "Something went wrong.");
      break;

    default:
      console.warn("Unknown message:", msg);
  }
}

export function useGameState() {
  const [gameStatus, setGameStatus] = useState("connecting");
  const [side1, setSide1]           = useState(null);
  const [side2, setSide2]           = useState(null);
  const [gameState, setGameState]   = useState(null);
  const [powerUps, setPowerUps]     = useState([]);
  const [countdown, setCountdown]   = useState(null);
  const [winner, setWinner]         = useState(null);
  const [settings, setSettings]     = useState(null);
  const [error, setError]           = useState(null);

  const reset = useCallback(() => {
    setGameStatus("connecting");
    setSide1(null);
    setSide2(null);
    setGameState(null);
    setPowerUps([]);
    setCountdown(null);
    setWinner(null);
    setSettings(null);
    setError(null);
  }, []);

  const handleMessage1 = useCallback((msg) => {
    if (msg.type === "role") {
      setError(null);
      setSide1(msg.side);
      setGameStatus("waiting");
      return;
    }
    handleSharedMessage(msg, setGameStatus, setError, setSettings, setCountdown, setGameState, setPowerUps, setWinner);
  }, []);

  const handleMessage2 = useCallback((msg) => {
    if (msg.type === "role") {
      setError(null);
      setSide2(msg.side);
      setGameStatus("waiting");
      return;
    }
    handleSharedMessage(msg, setGameStatus, setError, setSettings, setCountdown, setGameState, setPowerUps, setWinner);
  }, []);

  return {
    gameStatus,
    side1,
    side2,
    gameState,
    powerUps,
    countdown,
    winner,
    settings,
    error,
    reset,
    handleMessage1,
    handleMessage2,
  };
}