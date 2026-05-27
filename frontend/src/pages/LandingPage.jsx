import styles from "./LandingPage.module.css"
import LeftContent from "../components/content/LandingPageContentLeft";
import RightContent from "../components/content/LandingPageContentRight";
import Footer from '../components/Footer';
import { useAuth } from "../components/auth/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Wrap them so the module styles apply directly */}
        <div className={styles.left}>
          <LeftContent />
        </div>
        <div className={styles.right}>
          <RightContent />
        </div>
      </div>
      <Footer />
    </div>
  );
}