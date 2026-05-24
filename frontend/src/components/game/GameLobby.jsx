import { useState } from 'react';
import styles from './GameLobby.module.css';

const BG_THEMES = [
  { id: 'classic', label: 'Classic', color: '#111111' },
  { id: 'ocean',   label: 'Ocean',   color: '#0a1628' },
  { id: 'forest',  label: 'Forest',  color: '#0d1f0f' },
  { id: 'dusk',    label: 'Dusk',    color: '#1a0a1f' },
];

export default function GameLobby({ selectedFriend, onClearFriend, onStart }) {
  const [mode, setMode]         = useState(null);
  const [powerUps, setPowerUps] = useState(false);
  const [winScore, setWinScore] = useState(5);
  const [bgTheme, setBgTheme]   = useState('classic');

  const [player2Token,    setPlayer2Token]    = useState(null);
  const [player2Email,    setPlayer2Email]    = useState('');
  const [player2Password, setPlayer2Password] = useState('');
  const [player2Error,    setPlayer2Error]    = useState('');
  const [player2Loading,  setPlayer2Loading]  = useState(false);

  const canStart = mode === 'local' || (mode === 'friend' && selectedFriend && player2Token);

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
        body: JSON.stringify({ email: player2Email, password: player2Password }),
      });
      const data = await res.json();
      if (!res.ok) { setPlayer2Error(data.error || 'Login failed'); return; }
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

      {/* Friend picker / Player 2 login */}
      {mode === 'friend' && (
        <div>
          {!selectedFriend && (
            <p className={styles.hint}>Select a friend from the list below ↓</p>
          )}

          {selectedFriend && !player2Token && (
            <div className={styles.player2Section}>
              <div className={styles.selectedFriendRow}>
                <span className={styles.selectedFriendText}>
                  Playing against <strong>{selectedFriend.username}</strong>
                </span>
                <button className={styles.clearButton} onClick={clearFriend}>✕</button>
              </div>
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
            </div>
          )}

          {selectedFriend && player2Token && (
            <div className={styles.readyRow}>
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

          {/* Winning score */}
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

          {/* Background theme */}
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

          {/* Power-ups toggle */}
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