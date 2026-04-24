export default function GameHUD({ status, side, countdown, winner }) {
  return (
    <div style={{ color: "white", textAlign: "center" }}>
      {status === "connecting" && <h2>Connecting...</h2>}

      {status === "waiting" && <h2>Waiting for opponent...</h2>}

      {status === "countdown" && (
        <h1 style={{ fontSize: "60px" }}>{countdown}</h1>
      )}

      {status === "playing" && <h3>You are: {side}</h3>}

      {status === "gameover" && <h1>Winner: {winner}</h1>}
    </div>
  );
}