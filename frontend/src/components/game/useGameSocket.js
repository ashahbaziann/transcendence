import { useEffect, useRef } from "react";

export function useGameSocket(onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to game server");
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      onMessage(msg);
    };

    socket.onclose = () => {
      console.log("Disconnected from game server");
    };

    return () => socket.close();
  }, []);

  function send(data) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }

  return { socketRef, send };
}