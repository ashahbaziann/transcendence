import { useEffect, useState } from "react";
import styles from "./FriendsList.module.css";


// Inga added May 23 - onInvite in function signature
export default function FriendsList({ userId, onInvite }) {
  const [friends, setFriends] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchFriends = () => {
    fetch(`https://localhost:8443/api/user/users/${userId}/friends`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []));
  };  

  useEffect(() => {
    fetchFriends();
    const interval = setInterval(fetchFriends, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSearch = async () => {
    setError("");
    setSearchResult(null);
    if (!searchInput.trim()) return;
    const res = await fetch(`https://localhost:8443/api/user/users?username=${searchInput.trim()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok || !data) { setError("User not found"); return; }
    // find matching user from list
    const found = Array.isArray(data)
      ? data.find(u => u.username.toLowerCase() === searchInput.trim().toLowerCase())
      : null;
    if (!found) { setError("User not found"); return; }
    if (found.user_id === userId) { setError("That's you!"); return; }
    setSearchResult(found);
  };

  const handleAdd = async (friendUserId) => {
    setError("");
    const res = await fetch(`https://localhost:8443/api/user/users/${userId}/friends/${friendUserId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to add friend"); return; }
    setSearchInput("");
    setSearchResult(null);
    fetchFriends();
  };

  const handleRemove = async (fid) => {
    await fetch(`https://localhost:8443/api/user/users/${userId}/friends/${fid}`, {
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
          type="text"
          placeholder="Search by username"
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); setSearchResult(null); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button className={styles.button} onClick={handleSearch}>Search</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {searchResult && (
        <div className={styles.searchResult}>
          <img
            src={searchResult.avatar
              ? searchResult.avatar.startsWith('http')
                ? searchResult.avatar
                : `https://localhost:8443/api/user${searchResult.avatar}`
              : `https://api.dicebear.com/7.x/identicon/svg?seed=${searchResult.username}`}
            alt={searchResult.username}
            className={styles.avatar}
          />
          <span className={styles.username}>{searchResult.username}</span>
          <button className={styles.button} onClick={() => handleAdd(searchResult.user_id)}>Add</button>
        </div>
      )}

      <div className={styles.list}>
        {friends.length === 0 && <p className={styles.empty}>No friends yet</p>}
        {friends.map(f => (
          <div key={f.user_id} className={styles.friend}>
            <img
              src={f.avatar
                ? f.avatar.startsWith('http')
                  ? f.avatar
                  : `https://localhost:8443/api/user${f.avatar}`
                : `https://api.dicebear.com/7.x/identicon/svg?seed=${f.username}`}
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

            {onInvite && f.online && (
              <button className={styles.button} onClick={() => onInvite(f)}>
                Invite
              </button>
            )}


          </div>
        ))}
      </div>
    </div>
  );
}

//Inga added May 23 - onInvite prop passed to FriendsList and invite button rendered for online friends.