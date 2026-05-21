import { useEffect } from "react";

export function useGameInput({ send, side }, enabled) {
  useEffect(() => {
    if (!enabled || !side) return;

    function handleKey(e, pressed) {
      const keys = ["w", "s", "ArrowUp", "ArrowDown"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      const keyMap = {
        left: {
          w: "w",
          ArrowUp: "w",
          s: "s",
          ArrowDown: "s",
        },
        right: {
          w: "ArrowUp",
          ArrowUp: "ArrowUp",
          s: "ArrowDown",
          ArrowDown: "ArrowDown",
        },
      };

      send({
        type: "key",
        key: keyMap[side][e.key],
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
  }, [send, side, enabled]);
}
