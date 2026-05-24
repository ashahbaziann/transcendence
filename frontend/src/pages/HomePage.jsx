import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getUserStats }   from '../api';
import FriendsList from '../components/content/FriendsList';

const POWERUP_DESCRIPTIONS = {
  speed_up:   { icon: '⚡', label: 'Speed up',    desc: 'Ball accelerates on hit' },
  slow_down:  { icon: '🧊', label: 'Slow down',   desc: 'Ball decelerates on hit' },
  big_paddle: { icon: '📏', label: 'Big paddle',  desc: 'Both paddles grow for 5s' },
};

const BG_THEMES = [
  { id: 'classic', label: 'Classic', color: '#111111' },
  { id: 'ocean',   label: 'Ocean',   color: '#0a1628' },
  { id: 'forest',  label: 'Forest',  color: '#0d1f0f' },
  { id: 'dusk',    label: 'Dusk',    color: '#1a0a1f' },
];

// ─── small reusable pieces ────────────────────────────────────────────────────

function Avatar({ user, size = 44 }) {
  const initials = (user?.username || user?.email || '?')
    .slice(0, 2).toUpperCase();
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1D9E75', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, color: '#fff',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: '#888780',
      margin: '0 0 14px', padding: '0 0 8px',
      borderBottom: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      {children}
    </h2>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '20px 22px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────

function StatsPanel({ userId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!userId) return;
    getUserStats(userId).then(setStats).catch(() => {});
  }, [userId]);

  const wins   = stats?.wins   ?? 0;
  const losses = stats?.losses ?? 0;
  const total  = wins + losses;
  const ratio  = total ? Math.round((wins / total) * 100) : 0;

  return (
    <Card>
      <SectionTitle>My stats</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Wins',     value: wins,        color: '#1D9E75' },
          { label: 'Losses',   value: losses,      color: '#E24B4A' },
          { label: 'Win rate', value: `${ratio}%`, color: '#EF9F27' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 10,
            padding: '14px 10px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {stats?.recentMatches?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectionTitle>Recent matches</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stats.recentMatches.slice(0, 5).map((m, i) => {
              const won = m.winnerId === userId;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: won ? '#1D9E75' : '#E24B4A' }}>
                    {won ? 'WIN' : 'LOSS'}
                  </span>
                  <span style={{ fontSize: 12, color: '#ccc' }}>
                    {m.winnerScore} – {m.loserScore}
                  </span>
                  <span style={{ fontSize: 11, color: '#888780' }}>
                    vs {m.opponentName || 'Unknown'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── About panel ─────────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <Card>
      <SectionTitle>How to play</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { keys: 'W / S',  role: 'Left paddle (Player 1)' },
          { keys: '↑ / ↓', role: 'Right paddle (Player 2)' },
        ].map(({ keys, role }) => (
          <div key={keys} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <kbd style={{
              fontFamily: 'monospace', fontSize: 12,
              padding: '3px 8px', borderRadius: 6,
              border: '0.5px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.07)',
              color: '#eee', whiteSpace: 'nowrap',
            }}>{keys}</kbd>
            <span style={{ fontSize: 13, color: '#aaa' }}>{role}</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: '#888780', margin: '4px 0 0', lineHeight: 1.6 }}>
          First to reach the winning score wins. Power-ups appear mid-game —
          hit the ball into them to activate.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {Object.values(POWERUP_DESCRIPTIONS).map(({ icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <div>
                <span style={{ fontSize: 12, color: '#ddd', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, color: '#888780' }}> — {desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Game Lobby ───────────────────────────────────────────────────────────────

function GameLobby({ user, selectedFriend, onClearFriend, onStart }) {
  const [mode, setMode]         = useState(null);
  const [powerUps, setPowerUps] = useState(false);
  const [winScore, setWinScore] = useState(5);
  const [bgTheme, setBgTheme]   = useState('classic');

  // Player 2 login state
  const [player2Token,    setPlayer2Token]    = useState(null);
  const [player2Email,    setPlayer2Email]    = useState('');
  const [player2Password, setPlayer2Password] = useState('');
  const [player2Error,    setPlayer2Error]    = useState('');
  const [player2Loading,  setPlayer2Loading]  = useState(false);

  const canStart = mode === 'local' || (mode === 'friend' && selectedFriend && player2Token);

  // Reset all player2 state and clear friend selection
  function clearFriend() {
    onClearFriend();
    setPlayer2Token(null);
    setPlayer2Email('');
    setPlayer2Password('');
    setPlayer2Error('');
  }

  async function handlePlayer2Login() {
    setPlayer2Loading(true);
    setPlayer2Error('');
    try {
      const res = await fetch('https://localhost:8443/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    player2Email,
          password: player2Password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlayer2Error(data.error || 'Login failed');
        return;
      }
      setPlayer2Token(data.token);
    } catch {
      setPlayer2Error('Could not connect to server');
    } finally {
      setPlayer2Loading(false);
    }
  }

  function handleStart() {
    onStart({
      mode,
      opponent:     selectedFriend,
      player2Token, // ← pass player2Token up
      settings: { powerUps, winScore, bgTheme },
    });
  }

  const inputStyle = {
    padding: '9px 12px', borderRadius: 8,
    border: '0.5px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#eee', fontSize: 13, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle>Game lobby</SectionTitle>

      {/* Mode selector */}
      <div>
        <p style={{ fontSize: 12, color: '#888780', margin: '0 0 10px' }}>Select mode</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { id: 'local',  icon: '🕹️', title: 'Local',       sub: 'Same keyboard' },
            { id: 'friend', icon: '👥', title: 'With friend', sub: 'From friends list' },
          ].map(({ id, icon, title, sub }) => (
            <button
              key={id}
              onClick={() => {
                setMode(id);
                if (id === 'local') {
                  clearFriend();
                }
              }}
              style={{
                padding: '14px 10px', borderRadius: 10, cursor: 'pointer',
                border: mode === id ? '1.5px solid #1D9E75' : '0.5px solid rgba(255,255,255,0.1)',
                background: mode === id ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                color: mode === id ? '#1D9E75' : '#aaa',
                textAlign: 'center', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Friend picker / Player 2 login */}
      {mode === 'friend' && (
        <div>
          {!selectedFriend && (
            <p style={{ fontSize: 12, color: '#888780', margin: 0 }}>
              Select a friend from the list below ↓
            </p>
          )}

          {selectedFriend && !player2Token && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Selected friend header with X button */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ fontSize: 13, color: '#ccc' }}>
                  Playing against <strong style={{ color: '#eee' }}>{selectedFriend.username}</strong>
                </span>
                <button
                  onClick={clearFriend}
                  style={{
                    background: 'none', border: 'none',
                    color: '#888780', cursor: 'pointer', fontSize: 16, padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Player 2 login form */}
              <p style={{ fontSize: 12, color: '#888780', margin: '4px 0 0' }}>
                {selectedFriend.username}, please log in to join:
              </p>
              <input
                type="email"
                placeholder={`${selectedFriend.username}'s email`}
                value={player2Email}
                onChange={e => { setPlayer2Email(e.target.value); setPlayer2Error(''); }}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={player2Password}
                onChange={e => { setPlayer2Password(e.target.value); setPlayer2Error(''); }}
                onKeyDown={e => e.key === 'Enter' && handlePlayer2Login()}
                style={inputStyle}
              />
              {player2Error && (
                <span style={{ fontSize: 12, color: '#E24B4A' }}>{player2Error}</span>
              )}
              <button
                onClick={handlePlayer2Login}
                disabled={player2Loading || !player2Password || !player2Email}
                style={{
                  padding: '9px 0', borderRadius: 8,
                  cursor: (player2Loading || !player2Password || !player2Email) ? 'not-allowed' : 'pointer',
                  background: 'rgba(29,158,117,0.15)',
                  border: '0.5px solid #1D9E75',
                  color: '#1D9E75', fontSize: 13, fontWeight: 600,
                  opacity: (player2Loading || !player2Password || !player2Email) ? 0.5 : 1,
                }}
              >
                {player2Loading ? 'Verifying…' : `Confirm as ${selectedFriend.username}`}
              </button>
            </div>
          )}

          {selectedFriend && player2Token && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                fontSize: 12, color: '#1D9E75',
                padding: '8px 10px', borderRadius: 6,
                background: 'rgba(29,158,117,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>✓ {selectedFriend.username} is ready</span>
                <button
                  onClick={clearFriend}
                  style={{
                    background: 'none', border: 'none',
                    color: '#888780', cursor: 'pointer', fontSize: 14, padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customization */}
      {mode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 12, color: '#888780', margin: 0 }}>Customization</p>

          {/* Winning score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>Winning score</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#eee' }}>{winScore}</span>
            </div>
            <input
              type="range" min={3} max={11} step={1}
              value={winScore}
              onChange={e => setWinScore(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#666' }}>3</span>
              <span style={{ fontSize: 10, color: '#666' }}>11</span>
            </div>
          </div>

          {/* Background theme */}
          <div>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 8px' }}>Background</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {BG_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setBgTheme(t.id)}
                  title={t.label}
                  style={{
                    width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                    background: t.color,
                    border: bgTheme === t.id ? '2px solid #1D9E75' : '0.5px solid rgba(255,255,255,0.2)',
                    padding: 0, position: 'relative',
                  }}
                >
                  {bgTheme === t.id && (
                    <span style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#1D9E75', fontSize: 13, fontWeight: 700,
                    }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Power-ups toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#aaa' }}>Power-ups</div>
              <div style={{ fontSize: 11, color: '#666' }}>speed · slow · big paddle</div>
            </div>
            <button
              onClick={() => setPowerUps(v => !v)}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: powerUps ? '#1D9E75' : 'rgba(255,255,255,0.1)',
                border: 'none', padding: 0, position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                left: powerUps ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{
          marginTop: 4, padding: '13px 0', borderRadius: 10,
          cursor: canStart ? 'pointer' : 'not-allowed',
          background: canStart ? '#1D9E75' : 'rgba(255,255,255,0.06)',
          border: 'none', color: canStart ? '#fff' : '#555',
          fontSize: 15, fontWeight: 600, letterSpacing: '0.03em',
          transition: 'all 0.15s',
        }}
      >
        {canStart ? '▶  Start game' : (
          mode === 'friend' && selectedFriend && !player2Token
            ? `Waiting for ${selectedFriend.username} to log in`
            : 'Select a mode to continue'
        )}
      </button>
    </Card>
  );
}

// ─── HomePage root ────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate          = useNavigate();
  const { user, loading } = useCurrentUser();
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Receive player2Token from GameLobby and pass it to navigate state
  function handleStart({ mode, opponent, player2Token, settings }) {
    navigate('/game', {
      state: {
        mode,
        opponentId:    opponent?.user_id ?? null,
        opponentToken: player2Token ?? null, // ← correctly forwarded
        settings,
      },
    });
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0d0d',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#888780', fontFamily: 'monospace',
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0d', color: '#eee',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <header style={{
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 18, fontWeight: 700, letterSpacing: '0.06em',
          color: '#1D9E75', fontFamily: 'monospace',
        }}>
          PONG
        </span>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <Avatar user={user} size={32} />
            </div>
            <span style={{ fontSize: 13, color: '#ccc' }}>{user.username}</span>
          </div>
        )}
      </header>

      {/* Main layout */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '28px 24px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 20,
        alignItems: 'start',
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StatsPanel userId={user?.userId} />
          <AboutPanel />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GameLobby
            user={user}
            selectedFriend={selectedFriend}
            onClearFriend={() => setSelectedFriend(null)}
            onStart={handleStart}
          />
          <FriendsList
            userId={user?.userId}
            onInvite={(f) => setSelectedFriend(f)}
          />
        </div>
      </div>
    </div>
  );
}