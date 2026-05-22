import { useEffect, useState } from "react";
import styles from "./FriendsList.module.css";

export default function FriendsList({ userId }) {
  const [friends, setFriends] = useState([]);
  const [friendId, setFriendId] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchFriends = () => {
    fetch(`http://localhost:3002/users/${userId}/friends`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchFriends(); }, [userId]);

  const handleAdd = async () => {
    setError("");
    if (!friendId) return;
    const res = await fetch(`http://localhost:3002/users/${userId}/friends/${friendId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to add friend"); return; }
    setFriendId("");
    fetchFriends();
  };

  const handleRemove = async (fid) => {
    await fetch(`http://localhost:3002/users/${userId}/friends/${fid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchFriends();
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Friends</h2>

      <div className={styles.addWrapper}>
        <input
          className={styles.input}
          type="number"
          placeholder="Friend's user ID"
          value={friendId}
          onChange={e => setFriendId(e.target.value)}
        />
        <button className={styles.button} onClick={handleAdd}>Add</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {friends.length === 0 && <p className={styles.empty}>No friends yet</p>}
        {friends.map(f => (
          <div key={f.user_id} className={styles.friend}>
            <img
              src={f.avatar ? `http://localhost:3002${f.avatar}` : `https://api.dicebear.com/7.x/identicon/svg?seed=${f.username}`}
              alt={f.username}
              className={styles.avatar}
            />
            <div className={styles.info}>
              <span className={styles.username}>{f.username}</span>
              <span className={f.online ? styles.online : styles.offline}>
                {f.online ? "● Online" : "○ Offline"}
              </span>
            </div>
            <button className={styles.remove} onClick={() => handleRemove(f.user_id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
