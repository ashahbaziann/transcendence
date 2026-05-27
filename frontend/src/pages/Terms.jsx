import styles from './LegalPage.module.css';

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Legal</span>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.meta}>Last updated: May 2025</p>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h2>1. Acceptance of terms</h2>
            <p>
              By accessing or using Transcendence ("the platform"), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use the platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Description of service</h2>
            <p>
              Transcendence is a web-based multiplayer Pong game platform built as part of the
              42 school curriculum. It allows users to register, log in, manage a profile, add
              friends, and play Pong matches in real time against other users.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Account registration</h2>
            <p>To use the platform you must:</p>
            <ul>
              <li>Provide a valid email address and a secure password, or authenticate via 42 OAuth.</li>
              <li>Keep your login credentials confidential and not share them with others.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
              <li>Notify us immediately if you suspect any unauthorised use of your account.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to other users' accounts or the server infrastructure.</li>
              <li>Exploit bugs or vulnerabilities to gain an unfair advantage in gameplay.</li>
              <li>Harass, abuse, or harm other users through the platform's social features.</li>
              <li>Upload avatars or use usernames that are offensive, defamatory, or infringe third-party rights.</li>
              <li>Attempt to reverse-engineer or tamper with the platform's backend services.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Gameplay rules</h2>
            <p>
              Transcendence is a fair-play platform. Disconnecting intentionally to avoid a loss,
              using automated scripts to control your paddle, or manipulating game state via the
              WebSocket API is prohibited and may result in account suspension.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. User content</h2>
            <p>
              You retain ownership of any content you upload (e.g. avatar images). By uploading
              content, you grant us a limited licence to store and display it within the platform.
              You are solely responsible for ensuring your uploads do not infringe any third-party rights.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Availability and modifications</h2>
            <p>
              This platform is provided as-is for educational purposes. We do not guarantee
              uninterrupted availability. We reserve the right to modify, suspend, or discontinue
              the service at any time without notice.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, the Transcendence team shall not be liable
              for any indirect, incidental, or consequential damages arising from your use of or
              inability to use the platform, including loss of game data or account access.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms.
              You may also delete your account at any time by requesting removal of your data.
            </p>
          </section>

          <section className={styles.section}>
            <h2>10. Changes to these terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the platform
              after changes are posted constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2>11. Contact</h2>
            <p>
              For any questions about these terms, please contact the project team via the
              42 intra messaging system or your project repository.
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <a href="/" className={styles.back}>← Back to home</a>
          <a href="/privacy" className={styles.link}>Privacy Policy →</a>
        </div>
      </div>
    </div>
  );
}