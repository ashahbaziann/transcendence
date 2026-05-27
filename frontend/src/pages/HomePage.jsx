import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import StatsPanel from '../components/content/StatsPanel';
import AboutPanel from '../components/content/AboutPanel';
import GameLobby from '../components/game/GameLobby';
import styles from './HomePage.module.css';

function Avatar({ user, size = 44 }) {
  const initials = (user?.username || user?.email || '?').slice(0, 2).toUpperCase();
  if (user?.avatar) {
    const src = user.avatar.startsWith('http')
      ? user.avatar
      : `https://localhost:8443/api/user${user.avatar}`;
    return (
      <img
        src={src}
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

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const [selectedFriend, setSelectedFriend] = useState(null);


  function handleStart({ mode, opponent, player2Token, settings }) {
    navigate('/game', {
      state: {
        mode,
        opponentId:    opponent?.user_id ?? null,
        opponentToken: player2Token ?? null,
        opponentName:  opponent?.username ?? null,
        settings,
      },
    });
  }

  if (loading) {
    return <div className={styles.loading}>Loading…</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>PONG</span>
        {user && (
          <div className={styles.userInfo} onClick={() => navigate('/profile')}>
            <Avatar user={user} size={32} />
            <span className={styles.username}>{user.username}</span>
          </div>
        )}
      </header>

      <main className={styles.main}>
        <div className={styles.leftCol}>
          <StatsPanel userId={user?.user_id} />
          <AboutPanel />
        </div>
        <div className={styles.rightCol}>
          <GameLobby
            userId={user?.user_id}
            selectedFriend={selectedFriend}
            onSelectFriend={setSelectedFriend}
            onClearFriend={() => setSelectedFriend(null)}
            onStart={handleStart}
          />
        </div>
      </main>
    </div>
  );
}