import { useCallback, useEffect, useRef, useState } from "react";

export function useGameSocket(onMessage, enabled = true, token = null) {
  const socketRef    = useRef(null);
  const onMessageRef = useRef(onMessage);
  const [isReady, setIsReady]       = useState(false);
  const [connectKey, setConnectKey] = useState(0); // bump to force reconnect

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;

    const tok = token ?? localStorage.getItem("token");

    if (!tok) {
      onMessageRef.current({
        type: "error",
        message: "You need to log in before starting a game.",
      });
      return;
    }

    // Close any existing socket first
    if (socketRef.current) {
      socketRef.current.onclose = null; // suppress the disconnected message on manual close
      socketRef.current.close();
      socketRef.current = null;
    }

    const baseUrl = import.meta.env.VITE_GAME_WS_URL || "wss://localhost:8443/ws/";
    const url = new URL(baseUrl);
    url.searchParams.set("token", tok);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to game server");
      setIsReady(true);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessageRef.current(msg);
      } catch {
        onMessageRef.current({
          type: "error",
          message: "Game server sent an invalid message.",
        });
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from game server");
      setIsReady(false);
      onMessageRef.current({ type: "disconnected" });
    };

    socket.onerror = () => {
      onMessageRef.current({
        type: "error",
        message: "Could not connect to the game server.",
      });
    };

    return () => {
      socket.onclose = null; // suppress disconnect message on cleanup
      socket.close();
      setIsReady(false);
    };
  }, [enabled, token, connectKey]); // connectKey triggers a fresh connection

  const send = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  // Call this to close the current socket and open a brand new one
  const reconnect = useCallback(() => {
    setIsReady(false);
    setConnectKey((k) => k + 1);
  }, []);

  return { socketRef, send, isReady, reconnect };
}