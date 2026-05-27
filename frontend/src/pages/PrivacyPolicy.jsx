import styles from './LegalPage.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Legal</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.meta}>Last updated: May 2025</p>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Transcendence ("we", "our", "us"). This Privacy Policy explains how we collect,
              use, and protect your personal information when you use our web-based Pong platform.
              By using Transcendence, you agree to the practices described in this policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Information we collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
              <li><strong>Account data:</strong> your username, email address, and hashed password when you register.</li>
              <li><strong>OAuth data:</strong> if you sign in via 42 OAuth, we receive your 42 intra username and email.</li>
              <li><strong>Profile data:</strong> avatar images you choose to upload.</li>
              <li><strong>Game data:</strong> match history, wins, losses, and draws.</li>
              <li><strong>Technical data:</strong> connection metadata such as IP address and browser type, collected automatically for security and performance monitoring.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. How we use your information</h2>
            <p>We use your data to:</p>
            <ul>
              <li>Authenticate you and keep your account secure.</li>
              <li>Display your profile, stats, and friend list within the platform.</li>
              <li>Enable real-time multiplayer gameplay.</li>
              <li>Monitor service health and prevent abuse.</li>
            </ul>
            <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Two-factor authentication</h2>
            <p>
              If you enable 2FA, we store a hashed secret associated with your account to validate
              one-time passwords. This secret is never exposed via any API endpoint.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Data retention</h2>
            <p>
              Your account data is retained for as long as your account is active. You may request
              deletion of your account and associated data at any time by contacting us. Game statistics
              may be retained in anonymised form for platform analytics.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Security</h2>
            <p>
              All data is transmitted over HTTPS. Passwords are hashed and salted before storage.
              JWT tokens are used for session management and expire after a set period. We use
              industry-standard practices to protect your data, but no system is completely secure.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Cookies and local storage</h2>
            <p>
              We use browser local storage to store your authentication token. We do not use
              third-party tracking cookies or advertising cookies.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Your rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Withdraw consent to data processing at any time.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>9. Contact</h2>
            <p>
              For any privacy-related questions or requests, please contact the project team
              through the 42 intra messaging system or via your project repository.
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <a href="/" className={styles.back}>← Back to home</a>
          <a href="/terms" className={styles.link}>Terms of Service →</a>
        </div>
      </div>
    </div>
  );
}