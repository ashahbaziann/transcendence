import { useEffect, useState } from "react";
import styles from "./LandingPageContentLeft.module.css";

export default function LandingPageContentLeft() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [vel, setVel] = useState({ dx: 2, dy: 1.5 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((prev) => {
        let x = prev.x + vel.dx;
        let y = prev.y + vel.dy;

        let dx = vel.dx;
        let dy = vel.dy;

        // LEFT / RIGHT WALL
        if (x <= 0 || x >= 95) {
          dx = -dx;
        }

        // TOP / BOTTOM WALL
        if (y <= 0 || y >= 90) {
          dy = -dy;
        }

        setVel({ dx, dy });

        return { x, y };
      });
    }, 16); // ~60fps (smooth like a game)

    return () => clearInterval(interval);
  }, [vel]);

  return (
    <div className={styles.wrapper}>

        <h1 className={styles.logo}>TRANSCENDENCE </h1>
        <h2 style={{ textAlign: "center" }}>Pong Game </h2>
        <div className={styles.board}>
            <div
            className={styles.ball}
            style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
            }}
            />
        </div>
        <p className={styles.subtitle}>Originally an engineering training experiment, not a game.</p>
    </div>
  );
}