import { useState } from 'react';

/**
 * TwoFactorSettings
 * Drop this component anywhere in your profile page:
 *
 *   import TwoFactorSettings from '../components/TwoFactorSettings';
 *   <TwoFactorSettings token={token} />
 *
 * `token` is the JWT from localStorage / AuthContext.
 */
export default function TwoFactorSettings({ token }) {
  const [step, setStep]       = useState('idle'); // idle | qr | done
  const [qrSvg, setQrSvg]     = useState('');
  const [otp, setOtp]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '20px 22px',
  };

  const inputStyle = {
    padding: '9px 12px', borderRadius: 8,
    border: '0.5px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#eee', fontSize: 20, outline: 'none',
    textAlign: 'center', letterSpacing: '0.3em',
    width: '100%', boxSizing: 'border-box',
  };

  // Step 1 — request QR code from backend
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

  // Step 2 — verify OTP to confirm setup
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

  // ── idle: show Enable button ─────────────────────────────────────────────
  if (step === 'idle') {
    return (
      <div style={cardStyle}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#888780',
          margin: '0 0 14px', padding: '0 0 8px',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          Two-factor authentication
        </h2>
        <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 16px', lineHeight: 1.6 }}>
          Add an extra layer of security. Once enabled, you'll need a code
          from your authenticator app every time you log in.
        </p>
        {error && <p style={{ color: '#E24B4A', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          onClick={handleEnable}
          disabled={loading}
          style={{
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(29,158,117,0.15)',
            border: '0.5px solid #1D9E75',
            color: '#1D9E75', fontSize: 13, fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Loading…' : 'Enable 2FA'}
        </button>
      </div>
    );
  }

  // ── qr: show QR code + OTP input ────────────────────────────────────────
  if (step === 'qr') {
    return (
      <div style={cardStyle}>
        <h2 style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#888780',
          margin: '0 0 14px', padding: '0 0 8px',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          Scan QR code
        </h2>

        <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 16px', lineHeight: 1.6 }}>
          Scan this QR code with Google Authenticator, Authy, or any TOTP app.
          Then enter the 6-digit code below to confirm setup.
        </p>

        {/* QR code rendered as inline SVG from backend */}
        <div
        style={{
            background: '#fff', borderRadius: 10,
            padding: 12, display: 'inline-block',
            marginBottom: 20,
            lineHeight: 0,
        }}
        dangerouslySetInnerHTML={{ __html: qrSvg
            .replace(/<svg /, '<svg width="200" height="200" ')
        }}
        />

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
            style={inputStyle}
            autoFocus
          />

          {error && <p style={{ color: '#E24B4A', fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                background: '#1D9E75', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600,
                opacity: (loading || otp.length !== 6) ? 0.5 : 1,
              }}
            >
              {loading ? 'Verifying…' : 'Confirm & activate'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('idle'); setQrSvg(''); setOtp(''); setError(''); }}
              style={{
                padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                color: '#888780', fontSize: 13,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── done: success ────────────────────────────────────────────────────────
  return (
    <div style={cardStyle}>
      <h2 style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#888780',
        margin: '0 0 14px', padding: '0 0 8px',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        Two-factor authentication
      </h2>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 8,
        background: 'rgba(29,158,117,0.08)',
        border: '0.5px solid rgba(29,158,117,0.3)',
      }}>
        <span style={{ fontSize: 20 }}>✓</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75' }}>
            2FA is active
          </div>
          <div style={{ fontSize: 12, color: '#888780', marginTop: 2 }}>
            Your account is protected with two-factor authentication.
          </div>
        </div>
      </div>
    </div>
  );
}