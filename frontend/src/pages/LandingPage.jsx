import RegisterForm from "../components/auth/RegisterForm";
import LoginForm from "../components/auth/LoginForm";
import styles from "./LandingPage.module.css"
import LandingPageContentLeft from "../components/content/LandingPageContentLeft";


export default function Home() {
  return (
    <div className={styles.container}>
      
      <LandingPageContentLeft />

      <div className={styles.right}>
        
        <div className={styles.forms}>
        
          <LoginForm />
          <RegisterForm />
        
        </div>

      </div>

    </div>
  );
}
