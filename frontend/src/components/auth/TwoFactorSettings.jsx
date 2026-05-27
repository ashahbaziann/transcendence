import { useState, useEffect } from 'react';
import styles from './TwoFactorSettings.module.css';

export default function TwoFactorSettings({ token }) {
  const [step, setStep]       = useState('loading');
  const [qrSvg, setQrSvg]     = useState('');
  const [otp, setOtp]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('https://localhost:8443/auth/2fa/status', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStep(data.enabled ? 'done' : 'idle'))
      .catch(() => setStep('idle'));
  }, [token]);

  if (step === 'loading') return null;

  async function handleEnable() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/2fa/enable', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to enable 2FA'); return; }
      setQrSvg(data.qrSvg);
      setStep('qr');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code'); return; }
      setStep('done');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'idle') {
    return (
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Two-factor authentication</h2>
        <p className={styles.description}>
          Add an extra layer of security. Once enabled, you'll need a code
          from your authenticator app every time you log in.
        </p>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.enableButton} onClick={handleEnable} disabled={loading}>
          {loading ? 'Loading…' : 'Enable 2FA'}
        </button>
      </div>
    );
  }

  if (step === 'qr') {
    return (
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Scan QR code</h2>
        <p className={styles.description}>
          Scan this QR code with Google Authenticator, Authy, or any TOTP app.
          Then enter the 6-digit code below to confirm setup.
        </p>

        <div
          className={styles.qrWrapper}
          dangerouslySetInnerHTML={{ __html: qrSvg
            .replace(/<svg /, '<svg width="200" height="200" ')
          }}
        />

        <form className={styles.form} onSubmit={handleVerify}>
          <input
            className={styles.otpInput}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonRow}>
            <button
              className={styles.confirmButton}
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying…' : 'Confirm & activate'}
            </button>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={() => { setStep('idle'); setQrSvg(''); setOtp(''); setError(''); }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Two-factor authentication</h2>
      <div className={styles.successBox}>
        <span style={{ fontSize: 20 }}>✓</span>
        <div>
          <div className={styles.successTitle}>2FA is active</div>
          <div className={styles.successSub}>Your account is protected with two-factor authentication.</div>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    <button
      className={styles.cancel2FA}
      onClick={async () => {
        setLoading(true);
        setError('');
        try {
          const res = await fetch('https://localhost:8443/auth/2fa/disable', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) { setError('Failed to disable 2FA'); return; }
          setStep('idle');
        } catch {
          setError('Network error');
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
    >
      {loading ? 'Disabling…' : 'Disable 2FA'}
    </button>
    </div>
  );
}