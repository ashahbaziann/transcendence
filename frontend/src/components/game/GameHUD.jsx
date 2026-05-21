// export default function GameHUD({ status, side, countdown, winner, error, isLocal }) {
//   return (
//     <div style={{ color: "white", textAlign: "center" }}>
//       {status === "connecting" && <h2>Connecting...</h2>}
//       {status === "waiting" && <h2>Waiting for opponent...</h2>}
//       {status === "countdown" && (
//         <h1 style={{ fontSize: "60px" }}>{countdown}</h1>
//       )}
//       {status === "playing" && (
//         <h3>{isLocal ? "W/S  vs  ↑/↓" : `You are: ${side}`}</h3>
//       )}
//       {status === "gameover" && <h1>Winner: {winner}</h1>}
//       {status === "disconnected" && <h2>{error || "Disconnected"}</h2>}
//       {status === "error" && <h2>{error}</h2>}
//     </div>
//   );
// }

export default function GameHUD({
  status, side, countdown, winner, error,
  isLocal, onPlayAgain, onGoHome,
}) {
  const overlay = (children) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {children}
    </div>
  );

  const btn = (label, onClick, accent = false) => (
    <button
      onClick={onClick}
      style={{
        marginTop: 12, padding: '10px 28px',
        borderRadius: 8, cursor: 'pointer',
        background: accent ? '#1D9E75' : 'transparent',
        border: `0.5px solid ${accent ? '#1D9E75' : 'rgba(255,255,255,0.3)'}`,
        color: '#fff', fontSize: 14, fontWeight: 600,
      }}
    >
      {label}
    </button>
  );

  if (status === 'connecting') return overlay(
    <p style={{ color: '#888780', fontSize: 16 }}>Connecting…</p>
  );

  if (status === 'waiting') return overlay(
    <p style={{ color: '#ccc', fontSize: 18 }}>Waiting for opponent…</p>
  );

  if (status === 'countdown') return overlay(
    <div style={{
      fontSize: 100, fontWeight: 800, color: '#1D9E75',
      lineHeight: 1, fontFamily: 'monospace',
    }}>
      {countdown}
    </div>
  );

  if (status === 'playing') return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      fontSize: 12, color: 'rgba(255,255,255,0.3)',
      fontFamily: 'monospace', zIndex: 5,
    }}>
      {isLocal ? 'W/S  ·  ↑/↓' : `You are: ${side}`}
    </div>
  );

  if (status === 'gameover') return overlay(<>
    <div style={{ fontSize: 13, color: '#888780', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Game over
    </div>
    <div style={{ fontSize: 48, fontWeight: 800, color: '#1D9E75', marginTop: 8 }}>
      {winner === 'left' ? 'Player 1' : 'Player 2'} wins
    </div>
    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
      {btn('Play again', onPlayAgain, true)}
      {btn('Home', onGoHome)}
    </div>
  </>);

  if (status === 'disconnected' || status === 'error') return overlay(<>
    <div style={{ fontSize: 18, color: '#E24B4A' }}>
      {error || 'Disconnected'}
    </div>
    {btn('Go home', onGoHome)}
  </>);

  return null;
}