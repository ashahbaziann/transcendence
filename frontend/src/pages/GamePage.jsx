import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GameCanvas from "../components/game/GameCanvas";
import GameHUD    from "../components/game/GameHUD";
import { useGameState }  from "../components/game/useGameState";
import { useGameSocket } from "../components/game/useGameSocket";

export default function GamePage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const {
    mode          = "local",
    opponentToken = null,
    settings      = {},
  } = location.state || {};

  const isLocal = mode === "local" || mode === "friend";

  const {
    gameStatus,
    side1,
    gameState,
    powerUps,
    countdown,
    winner,
    error,
    reset,
    handleMessage1,
    handleMessage2,
  } = useGameState();

  const { send: send1, isReady: ready1, reconnect: reconnect1 } = useGameSocket(handleMessage1, true, null);
  const { send: send2, reconnect: reconnect2 }                  = useGameSocket(handleMessage2, isLocal, opponentToken);

  // Send settings the moment socket1 is open
  useEffect(() => {
    if (!ready1) return;
    send1({
      type:         "settings",
      powerUps:     settings.powerUps  ?? false,
      winningScore: settings.winScore  ?? 5,
      bgTheme:      settings.bgTheme   ?? "classic",
    });
  }, [ready1]); // eslint-disable-line react-hooks/exhaustive-deps

  // Key input
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
    reset();       // clear all game state
    reconnect1();  // close socket1 and open a fresh one
    reconnect2();  // close socket2 and open a fresh one
    // no navigation — stays on /game, sockets reconnect, server pairs them fresh
  }

  const bgColor = {
    classic: "#111111",
    ocean:   "#0a1628",
    forest:  "#0d1f0f",
    dusk:    "#1a0a1f",
  }[settings.bgTheme || "classic"] || "#111111";

  return (
    <div style={{
      background: bgColor,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
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
        onPlayAgain={handlePlayAgain}
        onGoHome={() => navigate("/home")}
      />
      <GameCanvas
        gameState={gameState}
        powerUps={powerUps}
        bgColor={bgColor}
      />
    </div>
  );
}