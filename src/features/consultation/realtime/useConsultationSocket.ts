import React from 'react';
import { API_CONFIG } from '@/config/api.config';
import {
  ConsultationSocketClient,
  type ConsultationJoinedPayload,
  type ConsultationSocketClientOptions,
  type ConsultationSocketFactory,
  type ConsultationSocketMessage,
  type ConsultationSocketStatus,
} from './consultationSocketClient';

interface UseConsultationSocketOptions {
  appointmentId: string;
  accessToken: string | null | undefined;
  enabled?: boolean;
  baseUrl?: string;
  socketFactory?: ConsultationSocketFactory;
  onJoined?: (payload: ConsultationJoinedPayload) => void;
  onMessage?: (message: ConsultationSocketMessage) => void;
  onError?: (error: Error) => void;
}

export interface UseConsultationSocketResult {
  status: ConsultationSocketStatus;
  isConnected: boolean;
  isReconnecting: boolean;
  sendMessage: (content: string) => boolean;
  disconnect: () => void;
}

export const useConsultationSocket = ({
  appointmentId,
  accessToken,
  enabled = true,
  baseUrl = API_CONFIG.BASE_URL,
  socketFactory,
  onJoined,
  onMessage,
  onError,
}: UseConsultationSocketOptions): UseConsultationSocketResult => {
  const [status, setStatus] = React.useState<ConsultationSocketStatus>('idle');
  const clientRef = React.useRef<ConsultationSocketClient | null>(null);
  const callbacksRef = React.useRef<
    Pick<ConsultationSocketClientOptions, 'onJoined' | 'onMessage' | 'onError'>
  >({
    onJoined,
    onMessage,
    onError,
  });

  React.useEffect(() => {
    callbacksRef.current = { onJoined, onMessage, onError };
  }, [onJoined, onMessage, onError]);

  React.useEffect(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;

    if (!enabled) {
      setStatus('idle');
      return undefined;
    }

    const client = new ConsultationSocketClient({
      appointmentId,
      accessToken,
      baseUrl,
      socketFactory,
      onStatusChange: setStatus,
      onJoined: (payload) => callbacksRef.current.onJoined?.(payload),
      onMessage: (message) => callbacksRef.current.onMessage?.(message),
      onError: (error) => callbacksRef.current.onError?.(error),
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [accessToken, appointmentId, baseUrl, enabled, socketFactory]);

  const sendMessage = React.useCallback((content: string) => {
    return clientRef.current?.sendMessage(content) ?? false;
  }, []);

  const disconnect = React.useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting',
    sendMessage,
    disconnect,
  };
};
