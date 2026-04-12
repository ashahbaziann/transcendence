import styles from "./LandingPage.module.css"
import LeftContent from "../components/content/LandingPageContentLeft";
import RightContent from "../components/content/LandingPageContentRight";


export default function LandingPage() {
  return (
    <div className={styles.container}>
      
      <LeftContent />
      <RightContent />

    </div>
  );
}
