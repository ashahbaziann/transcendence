import { useEffect } from "react";

export function useGameInput({ send }, enabled) {
  useEffect(() => {
    if (!enabled) return;

    function handleKey(e, pressed) {
      const keys = ["w", "s", "ArrowUp", "ArrowDown"];
      if (!keys.includes(e.key)) return;

      send({
        type: "key",
        key: e.key,
        pressed,
      });
    }

    const keyDown = (e) => handleKey(e, true);
    const keyUp = (e) => handleKey(e, false);

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [send, enabled]);
}