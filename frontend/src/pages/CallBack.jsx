import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";

export default function CallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) { navigate("/"); return; }

    // If opened as a popup for Player 2 login, pass token to parent and close
    if (window.opener) {
      window.opener.postMessage({ type: 'PLAYER2_TOKEN', token }, '*');
      window.close();
      return;
    }

    // Normal flow — log in and go home
    login(token).then(() => navigate("/home"));
  }, []);

  return <div style={{
    minHeight: '100vh', background: '#0d0d0d',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#888780', fontFamily: 'monospace', fontSize: 14,
  }}>
    Logging you in…
  </div>;
}