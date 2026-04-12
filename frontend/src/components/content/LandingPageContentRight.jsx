import RegisterForm from "../auth/RegisterForm";
import LoginForm from "../auth/LoginForm";
import OauthButton from "../auth/OauthButton";
import styles from "./LandingPageContent.module.css"

export default function LandingPageContentRight() {
  return (
      <div className={styles.right}>
        
        <div className={styles.formsWrapper}>
        
          <LoginForm />
          <RegisterForm />
        
        </div>

        <div className={styles.oauthWrapper}>
          <OauthButton />
        </div>

      </div>
  );
}
