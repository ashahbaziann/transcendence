import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileCard.module.css";

export default function ProfileCard({ profile, userId, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const avatarUrl = avatarPreview ||
    (profile?.avatar
      ? `http://localhost:3002${profile.avatar}`
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${profile?.username}`);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarPreview(null);
    setSelectedFile(null);
    setUsername(profile?.username || "");
    setError("");
  };

  const handleSave = async () => {
    setError("");
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        const res = await fetch(`http://localhost:3002/users/${userId}/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Avatar upload failed");
          return;
        }
      }

      if (username !== profile?.username) {
        const res = await fetch(`http://localhost:3002/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ username })
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Update failed");
          return;
        }
      }

      setEditing(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      window.location.reload();
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }
  };

  return (
    <div className={styles.card}>
      <button className={styles.backButton} onClick={() => navigate("/")}>← Home</button>

      <img src={avatarUrl} alt="avatar" className={styles.avatar} />

      {editing && (
        <div className={styles.uploadWrapper}>
          <label className={styles.fileLabel}>
            Change Avatar
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleAvatarChange}
              className={styles.fileInput}
            />
          </label>
        </div>
      )}

      {editing ? (
        <input
          className={styles.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      ) : (
        <h2 className={styles.username}>{profile?.username || "Unknown"}</h2>
      )}

      <p className={styles.email}>{profile?.email}</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile?.wins || 0}</span>
          <span className={styles.statLabel}>Wins</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile?.losses || 0}</span>
          <span className={styles.statLabel}>Losses</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile?.draws || 0}</span>
          <span className={styles.statLabel}>Draws</span>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.buttons}>
        {editing ? (
          <>
            <button className={styles.button} onClick={handleSave}>Save</button>
            <button className={styles.buttonSecondary} onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button className={styles.button} onClick={() => setEditing(true)}>Edit Profile</button>
        )}
        <button className={styles.buttonDanger} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
