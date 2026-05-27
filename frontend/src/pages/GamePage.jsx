import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GameCanvas from "../components/game/GameCanvas";
import GameHUD    from "../components/game/GameHUD";
import { useGameState }  from "../components/game/useGameState";
import { useGameSocket } from "../components/game/useGameSocket";
import { getUserById } from "../api";

export default function GamePage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const {
    mode          = "local",
    opponentToken = null,
    opponentId    = null,
    opponentName  = null,
    settings      = {},
  } = location.state || {};

  const isLocal = mode === "local" || mode === "friend";

  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState(opponentName || 'Player 2');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) {
        getUserById(payload.userId)
          .then(u => setPlayer1Name(u.username || 'Player 1'))
          .catch(() => {});
      }
    } catch {}
  }, []);

  const {
    gameStatus, side1, gameState, powerUps,
    countdown, winner, error, reset,
    handleMessage1, handleMessage2,
  } = useGameState();

  const { send: send1, isReady: ready1, reconnect: reconnect1 } = useGameSocket(handleMessage1, true, null);
  const { send: send2, reconnect: reconnect2 }                  = useGameSocket(handleMessage2, isLocal, opponentToken);

  useEffect(() => {
    if (!ready1) return;
    send1({
      type:         "settings",
      powerUps:     settings.powerUps  ?? false,
      winningScore: settings.winScore  ?? 5,
      bgTheme:      settings.bgTheme   ?? "classic",
    });
  }, [ready1]);

  useEffect(() => {
    if (gameStatus !== "playing") return;
    function handleKey(e, pressed) {
      if (e.key === "w" || e.key === "s") {
        e.preventDefault();
        send1({ type: "key", key: e.key, pressed });
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        isLocal
          ? send2({ type: "key", key: e.key, pressed })
          : send1({ type: "key", key: e.key, pressed });
      }
    }
    const down = (e) => handleKey(e, true);
    const up   = (e) => handleKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, [gameStatus, send1, send2, isLocal]);

  function handlePlayAgain() {
    reset();
    reconnect1();
    reconnect2();
  }

  const bgColor = {
    classic: "#111111",
    ocean:   "#0a1628",
    forest:  "#0d1f0f",
    dusk:    "#1a0a1f",
  }[settings.bgTheme || "classic"] || "#111111";

  return (
    <div style={{
      background: bgColor, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
    }}>
      <GameHUD
        status={gameStatus}
        side={side1}
        countdown={countdown}
        winner={winner}
        error={error}
        isLocal={isLocal}
        player1Name={player1Name}
        player2Name={player2Name}
        onPlayAgain={handlePlayAgain}
        onGoHome={() => navigate("/home")}
      />
      <GameCanvas
        gameState={gameState}
        powerUps={powerUps}
        bgColor={bgColor}
        player1Name={player1Name}
        player2Name={player2Name}
      />
    </div>
  );
}