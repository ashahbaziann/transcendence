import { useState, useEffect } from 'react';
import styles from './GameLobby.module.css';

const BG_THEMES = [
  { id: 'classic', label: 'Classic', color: '#111111' },
  { id: 'ocean',   label: 'Ocean',   color: '#0a1628' },
  { id: 'forest',  label: 'Forest',  color: '#0d1f0f' },
  { id: 'dusk',    label: 'Dusk',    color: '#1a0a1f' },
];

export default function GameLobby({ userId, selectedFriend, onSelectFriend, onClearFriend, onStart }) {
  const [mode, setMode]         = useState(null);
  const [powerUps, setPowerUps] = useState(false);
  const [winScore, setWinScore] = useState(5);
  const [bgTheme, setBgTheme]   = useState('classic');

  const [player2Otp,        setPlayer2Otp]        = useState('');
  const [player2Requires2fa, setPlayer2Requires2fa] = useState(false);
  const [player2Ticket,     setPlayer2Ticket]     = useState('');

  const [friends, setFriends]   = useState([]);

  const [player2Token,    setPlayer2Token]    = useState(null);
  const [player2Email,    setPlayer2Email]    = useState('');
  const [player2Password, setPlayer2Password] = useState('');
  const [player2Error,    setPlayer2Error]    = useState('');
  const [player2Loading,  setPlayer2Loading]  = useState(false);

  const canStart = mode === 'local' || (mode === 'friend' && selectedFriend && player2Token);

  useEffect(() => {
    if (mode !== 'friend' || !userId) return;
    const token = localStorage.getItem('token');
    fetch(`https://localhost:8443/api/user/users/${userId}/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [mode, userId]);

  function clearFriend() {
    onClearFriend();
    setPlayer2Token(null);
    setPlayer2Email('');
    setPlayer2Password('');
    setPlayer2Error('');
    setPlayer2Otp('');
    setPlayer2Requires2fa(false);
    setPlayer2Ticket('');
  }

  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'PLAYER2_TOKEN') {
        setPlayer2Token(e.data.token);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handleOAuthLogin() {
    window.open(
      'https://localhost:8443/auth/oauth/42',
      'player2-login',
      'width=600,height=700,menubar=no,toolbar=no,location=no'
    );
  }

  async function handlePlayer2Login() {
    setPlayer2Loading(true);
    setPlayer2Error('');
    try {
      const res = await fetch('https://localhost:8443/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: player2Email, password: player2Password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlayer2Error(data.error || 'Login failed');
        return;
      }
      if (data.requires2fa) {
        setPlayer2Ticket(data.loginTicket);
        setPlayer2Requires2fa(true);
        return;
      }
      setPlayer2Token(data.token);
    } catch {
      setPlayer2Error('Could not connect to server');
    } finally {
      setPlayer2Loading(false);
    }
  }

  async function handlePlayer2Otp() {
    setPlayer2Loading(true);
    setPlayer2Error('');
    try {
      const res = await fetch('https://localhost:8443/auth/2fa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginTicket: player2Ticket, otp: player2Otp }),
      });
      const data = await res.json();
      if (!res.ok) { setPlayer2Error(data.error || 'Invalid code'); return; }
      setPlayer2Token(data.token);
    } catch {
      setPlayer2Error('Could not connect to server');
    } finally {
      setPlayer2Loading(false);
    }
  }

  function handleStart() {
    onStart({ mode, opponent: selectedFriend, player2Token, settings: { powerUps, winScore, bgTheme } });
  }

  const getAvatarUrl = (f) => {
    if (!f.avatar) return `https://api.dicebear.com/7.x/identicon/svg?seed=${f.username}`;
    return f.avatar.startsWith('http') ? f.avatar : `https://localhost:8443/api/user${f.avatar}`;
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Game lobby</h2>

      {/* Mode selector */}
      <div>
        <p className={styles.label}>Select mode</p>
        <div className={styles.modeGrid}>
          {[
            { id: 'local',  icon: '🕹️', title: 'Local',       sub: 'Same keyboard' },
            { id: 'friend', icon: '👥', title: 'With friend', sub: 'From friends list' },
          ].map(({ id, icon, title, sub }) => (
            <button
              key={id}
              className={`${styles.modeButton} ${mode === id ? styles.modeButtonActive : ''}`}
              onClick={() => { setMode(id); if (id === 'local') clearFriend(); }}
            >
              <span className={styles.modeIcon}>{icon}</span>
              <span className={styles.modeTitle}>{title}</span>
              <span className={styles.modeSub}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Friend mode */}
      {mode === 'friend' && (
        <div className={styles.friendSection}>

          {/* Step 1 — no friend selected yet, show picker */}
          {!selectedFriend && (
            <div>
              <p className={styles.label}>Choose a friend to play with</p>
              {friends.length === 0 ? (
                <p className={styles.hint}>No friends added yet</p>
              ) : (
                <div className={styles.friendPickerList}>
                  {friends.map(f => (
                    <div key={f.user_id} className={styles.friendPickerRow}>
                      <img src={getAvatarUrl(f)} alt={f.username} className={styles.friendAvatar} />
                      <div className={styles.friendInfo}>
                        <span className={styles.friendName}>{f.username}</span>
                        <span className={f.online ? styles.online : styles.offline}>
                          {f.online ? '● Online' : '○ Offline'}
                        </span>
                      </div>
                      <button
                        className={styles.inviteButton}
                        onClick={() => onSelectFriend(f)}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — friend selected, show login form */}
          {selectedFriend && !player2Token && (
            <div className={styles.player2Section}>
              <div className={styles.selectedFriendRow}>
                <img src={getAvatarUrl(selectedFriend)} alt={selectedFriend.username} className={styles.friendAvatar} />
                <span className={styles.selectedFriendText}>
                  Playing against <strong>{selectedFriend.username}</strong>
                </span>
                <button className={styles.clearButton} onClick={clearFriend}>✕</button>
              </div>

              {!player2Requires2fa ? (
                <>
                  <p className={styles.hint}>{selectedFriend.username}, please log in to join:</p>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder={`${selectedFriend.username}'s email`}
                    value={player2Email}
                    onChange={e => { setPlayer2Email(e.target.value); setPlayer2Error(''); }}
                  />
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={player2Password}
                    onChange={e => { setPlayer2Password(e.target.value); setPlayer2Error(''); }}
                    onKeyDown={e => e.key === 'Enter' && handlePlayer2Login()}
                  />
                  {player2Error && <span className={styles.error}>{player2Error}</span>}
                  <button
                    className={styles.confirmButton}
                    onClick={handlePlayer2Login}
                    disabled={player2Loading || !player2Password || !player2Email}
                  >
                    {player2Loading ? 'Verifying…' : `Confirm as ${selectedFriend.username}`}
                  </button>

                  <div className={styles.divider}>or</div>

                  <button className={styles.oauthButton} onClick={handleOAuthLogin}>
                    Login with 42
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.hint}>Enter the 6-digit code from {selectedFriend.username}'s authenticator app:</p>
                  <input
                    className={styles.otpInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={player2Otp}
                    onChange={e => { setPlayer2Otp(e.target.value.replace(/\D/g, '')); setPlayer2Error(''); }}
                    onKeyDown={e => e.key === 'Enter' && handlePlayer2Otp()}
                    autoFocus
                  />
                  {player2Error && <span className={styles.error}>{player2Error}</span>}
                  <button
                    className={styles.confirmButton}
                    onClick={handlePlayer2Otp}
                    disabled={player2Loading || player2Otp.length !== 6}
                  >
                    {player2Loading ? 'Verifying…' : 'Confirm code'}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => { setPlayer2Requires2fa(false); setPlayer2Otp(''); setPlayer2Error(''); }}
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3 — player 2 verified */}
          {selectedFriend && player2Token && (
            <div className={styles.readyRow}>
              <img src={getAvatarUrl(selectedFriend)} alt={selectedFriend.username} className={styles.friendAvatar} />
              <span>✓ {selectedFriend.username} is ready</span>
              <button className={styles.clearButton} onClick={clearFriend}>✕</button>
            </div>
          )}
        </div>
      )}

      {/* Customization */}
      {mode && (
        <div className={styles.customization}>
          <p className={styles.label}>Customization</p>

          <div>
            <div className={styles.scoreRow}>
              <span className={styles.scoreLabel}>Winning score</span>
              <span className={styles.scoreValue}>{winScore}</span>
            </div>
            <input
              type="range" min={3} max={11} step={1}
              value={winScore}
              onChange={e => setWinScore(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>3</span><span>11</span>
            </div>
          </div>

          <div>
            <p className={styles.label}>Background</p>
            <div className={styles.themeRow}>
              {BG_THEMES.map(t => (
                <button
                  key={t.id}
                  title={t.label}
                  onClick={() => setBgTheme(t.id)}
                  className={`${styles.themeButton} ${bgTheme === t.id ? styles.themeButtonActive : ''}`}
                  style={{ background: t.color }}
                >
                  {bgTheme === t.id && <span className={styles.themeCheck}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.powerupRow}>
            <div>
              <div className={styles.powerupTitle}>Power-ups</div>
              <div className={styles.powerupSub}>speed · slow · big paddle</div>
            </div>
            <button
              className={`${styles.toggle} ${powerUps ? styles.toggleOn : ''}`}
              onClick={() => setPowerUps(v => !v)}
            >
              <span className={`${styles.toggleThumb} ${powerUps ? styles.toggleThumbOn : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        className={`${styles.startButton} ${canStart ? styles.startButtonActive : ''}`}
        onClick={handleStart}
        disabled={!canStart}
      >
        {canStart ? '▶  Start game' : (
          mode === 'friend' && selectedFriend && !player2Token
            ? `Waiting for ${selectedFriend.username} to log in`
            : 'Select a mode to continue'
        )}
      </button>
    </div>
  );
}