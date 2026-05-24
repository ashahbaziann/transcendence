import styles from "./LandingPage.module.css"
import LeftContent from "../components/content/LandingPageContentLeft";
import RightContent from "../components/content/LandingPageContentRight";
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
      
      <LeftContent />
      <RightContent />

    </div>
  );
}
