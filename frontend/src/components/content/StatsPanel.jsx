import { useState, useEffect } from 'react';
import { getUserStats } from '../../api';
import styles from './StatsPanel.module.css';

export default function StatsPanel({ userId }) {
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
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>My stats</h2>
      <div className={styles.statGrid}>
        {[
          { label: 'Wins',     value: wins,        className: styles.wins },
          { label: 'Losses',   value: losses,      className: styles.losses },
          { label: 'Win rate', value: `${ratio}%`, className: styles.ratio },
        ].map(({ label, value, className }) => (
          <div key={label} className={styles.statBox}>
            <div className={`${styles.statValue} ${className}`}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {stats?.recentMatches?.length > 0 && (
        <div className={styles.matchesSection}>
          <h2 className={styles.sectionTitle}>Recent matches</h2>
          <div className={styles.matchList}>
            {stats.recentMatches.slice(0, 5).map((m, i) => {
              const won = m.winnerId === userId;
              return (
                <div key={i} className={styles.matchRow}>
                  <span className={won ? styles.win : styles.loss}>
                    {won ? 'WIN' : 'LOSS'}
                  </span>
                  <span className={styles.score}>
                    {m.winnerScore} – {m.loserScore}
                  </span>
                  <span className={styles.opponent}>
                    vs {m.opponentName || 'Unknown'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}