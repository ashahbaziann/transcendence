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

    if (token) {
              console.log("login() succeeded, navigating to /game");

      login(token).then(() => navigate("/home"));
    } else {
        console.error("login() threw:", err);
      navigate("/");
    }
  }, []);

  return <div>Logging you in...</div>;
}