import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function useSocket(events = {}) {
  const token = localStorage.getItem("vaibhav_access_token");
  const socket = useMemo(() => token ? io(SOCKET_URL, { auth: { token }, transports: ["websocket"] }) : null, [token]);
  useEffect(() => {
    if (!socket) return undefined;
    Object.entries(events).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      Object.entries(events).forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [socket, JSON.stringify(Object.keys(events))]);
  return socket;
}
