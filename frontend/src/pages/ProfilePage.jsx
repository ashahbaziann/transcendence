import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/content/ProfileCard";
import FriendsList from "../components/content/FriendsList";
import styles from "./ProfilePage.module.css";
import TwoFactorSettings from '../components/auth/TwoFactorSettings';


export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3002/users/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3005/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    logout();
    navigate("/");
  };

  if (loading) return <div className={styles.container}><p style={{color:"white"}}>Loading...</p></div>;

  const token = localStorage.getItem("token")

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ProfileCard profile={profile} userId={user?.userId} onLogout={handleLogout} />
        <FriendsList userId={user?.userId} />
        <TwoFactorSettings token={token} />
      </div>
    </div>
  );
}
