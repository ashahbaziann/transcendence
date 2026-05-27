import styles from "./AuthForm.module.css";

export default function OauthButton() {
  const handleLogin = () => {
    window.location.href = "https://localhost:8443/auth/oauth/42";
  };

  return (
    <button className={styles.oauth} onClick={handleLogin}>
      Login with 42
    </button>
  );
}