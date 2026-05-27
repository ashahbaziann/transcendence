import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styles from "./AuthForm.module.css";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");


  const [requires2fa, setRequires2fa] = useState(false);
  const [loginTicket, setLoginTicket] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      
      if (data.requires2fa && data.loginTicket) {
        setLoginTicket(data.loginTicket);
        setRequires2fa(true);
        return;
      }

      await login(data.token);
      navigate("/home");

    } catch (err) {
      console.error("Error:", err);
      setError("Network error!");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/auth/2fa/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginTicket, otp }),
      });
      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.error || "Invalid code");
        return;
      }

      await login(data.token);
      navigate("/home");

    } catch (err) {
      console.error("Error:", err);
      setOtpError("Network error!");
    } finally {
      setLoading(false);
    }
  };

  if (requires2fa) {
    return (
      <div>
        <div className={styles.card}>
          <h2 className={styles.title}>Two-Factor Auth</h2>
          <p style={{ fontSize: 13, color: '#888780', margin: '0 0 16px', textAlign: 'center' }}>
            Enter the 6-digit code from your authenticator app
          </p>

          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.3em' }}
              autoFocus
            />

            {otpError && (
              <p style={{ color: '#E24B4A', fontSize: 13, margin: 0, textAlign: 'center' }}>
                {otpError}
              </p>
            )}

            <button
              className={styles.button}
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => { setRequires2fa(false); setOtp(''); setOtpError(''); }}
              style={{
                background: 'none', border: 'none',
                color: '#888780', fontSize: 13, cursor: 'pointer',
              }}
            >
              ← Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Log In</h2>

        <input
          className={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && (
          <p style={{ color: '#E24B4A', fontSize: 13, margin: 0, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}