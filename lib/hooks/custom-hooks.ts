import React from "react";
import { baseUrl } from "../constants";

export const useSSE = (url: string) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [messages, setMessages] = React.useState<{ [key: string]: unknown }>(
    {}
  );
  const [error, setError] = React.useState<string | null>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectAttemptsRef = React.useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(data);
      } catch (err) {
        console.error("Failed to parse message. Error:", err);
        console.error("Failed data was:", event.data);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection lost, attempting to reconnect...");
      eventSource.close();
      handleReconnect();
    };
  };

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const retryTimeout = 1000 * Math.pow(2, reconnectAttemptsRef.current); // Exponential backoff
      setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, retryTimeout);
    } else {
      setError("Maximum reconnect attempts reached.");
    }
  };

  React.useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
    };
    // Eslint warning can safely be ignored here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { isConnected, messages, error };
};
