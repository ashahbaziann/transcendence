import styles from './AboutPanel.module.css';

const POWERUP_DESCRIPTIONS = {
  speed_up:   { icon: '⚡', label: 'Speed up',   desc: 'Ball accelerates on hit' },
  slow_down:  { icon: '🧊', label: 'Slow down',  desc: 'Ball decelerates on hit' },
  big_paddle: { icon: '📏', label: 'Big paddle', desc: 'Both paddles grow for 5s' },
};

export default function AboutPanel() {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>How to play</h2>
      <div className={styles.content}>
        <div className={styles.keyBindings}>
          {[
            { keys: 'W / S',  role: 'Left paddle (Player 1)' },
            { keys: '↑ / ↓', role: 'Right paddle (Player 2)' },
          ].map(({ keys, role }) => (
            <div key={keys} className={styles.keyRow}>
              <kbd className={styles.kbd}>{keys}</kbd>
              <span className={styles.role}>{role}</span>
            </div>
          ))}
        </div>

        <p className={styles.description}>
          First to reach the winning score wins. Power-ups appear mid-game —
          hit the ball into them to activate.
        </p>

        <div className={styles.powerupList}>
          {Object.values(POWERUP_DESCRIPTIONS).map(({ icon, label, desc }) => (
            <div key={label} className={styles.powerupRow}>
              <span className={styles.powerupIcon}>{icon}</span>
              <div>
                <span className={styles.powerupLabel}>{label}</span>
                <span className={styles.powerupDesc}> — {desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}