import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>Transcendence</span>
      <div className={styles.links}>
        <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
        <span className={styles.sep}>·</span>
        <Link to="/terms" className={styles.link}>Terms of Service</Link>
      </div>
    </footer>
  );
}