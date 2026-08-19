import { io, type Socket } from 'socket.io-client';

export const CONSULTATION_SOCKET_NAMESPACE = '/consultations';

export const CONSULTATION_SOCKET_EVENTS = {
  join: 'consultation:join',
  joined: 'consultation:joined',
  message: 'consultation:message',
} as const;

export type ConsultationSocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'auth_error'
  | 'error';

export interface ConsultationSocketSender {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}

export interface ConsultationSocketMessage {
  id?: string;
  consultationSessionId?: string;
  senderUserId?: string;
  content: string;
  messageType?: string;
  createdAt?: string;
  sender?: ConsultationSocketSender;
}

export interface ConsultationJoinedPayload {
  room: string;
  appointmentId: string;
  sessionId: string;
  status: string;
  channel: string;
  message?: string;
}

type SocketListener = (...args: any[]) => void;

export interface ConsultationSocketLike {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, payload?: unknown, callback?: SocketListener) => void;
  on: (event: string, listener: SocketListener) => void;
  off: (event: string, listener: SocketListener) => void;
}

export type ConsultationSocketFactory = (
  url: string,
  options: {
    auth: { token: string };
    transports: string[];
    autoConnect: boolean;
    reconnection: boolean;
  }
) => ConsultationSocketLike;

export interface ConsultationSocketClientOptions {
  appointmentId: string;
  accessToken: string | null | undefined;
  baseUrl: string;
  socketFactory?: ConsultationSocketFactory;
  onStatusChange?: (status: ConsultationSocketStatus) => void;
  onJoined?: (payload: ConsultationJoinedPayload) => void;
  onMessage?: (message: ConsultationSocketMessage) => void;
  onError?: (error: Error) => void;
}

const createDefaultSocket: ConsultationSocketFactory = (url, options) =>
  io(url, options) as Socket as ConsultationSocketLike;

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const toError = (value: unknown, fallback: string) => {
  if (value instanceof Error) return value;
  if (typeof value === 'string' && value.trim()) return new Error(value);
  if (value && typeof value === 'object' && 'message' in value) {
    const message = String((value as { message?: unknown }).message ?? fallback);
    return new Error(message);
  }
  return new Error(fallback);
};

export class ConsultationSocketClient {
  private readonly appointmentId: string;
  private readonly accessToken: string | null | undefined;
  private readonly baseUrl: string;
  private readonly socketFactory: ConsultationSocketFactory;
  private readonly onStatusChange?: (status: ConsultationSocketStatus) => void;
  private readonly onJoined?: (payload: ConsultationJoinedPayload) => void;
  private readonly onMessage?: (message: ConsultationSocketMessage) => void;
  private readonly onError?: (error: Error) => void;
  private socket: ConsultationSocketLike | null = null;
  private disposed = false;
  private joined = false;
  private readonly seenMessageIds = new Set<string>();

  private readonly handleConnect = () => {
    if (this.disposed) return;
    this.emitStatus('connected');
    this.joinRequestedRoom();
  };

  private readonly handleDisconnect = (reason?: string) => {
    if (this.disposed) return;
    this.joined = false;

    if (reason === 'io server disconnect') {
      this.emitStatus('auth_error');
      this.emitError(new Error('Realtime consultation connection was rejected.'));
      return;
    }

    this.emitStatus('reconnecting');
  };

  private readonly handleConnectError = (error: unknown) => {
    if (this.disposed) return;
    this.joined = false;
    this.emitStatus('auth_error');
    this.emitError(toError(error, 'Realtime consultation authentication failed.'));
  };

  private readonly handleJoined = (payload: ConsultationJoinedPayload) => {
    if (this.disposed) return;
    this.joined = true;
    this.emitStatus('connected');
    this.onJoined?.(payload);
  };

  private readonly handleMessage = (message: ConsultationSocketMessage) => {
    if (this.disposed) return;
    if (message.id) {
      if (this.seenMessageIds.has(message.id)) return;
      this.seenMessageIds.add(message.id);
    }
    this.onMessage?.(message);
  };

  constructor(options: ConsultationSocketClientOptions) {
    this.appointmentId = options.appointmentId;
    this.accessToken = options.accessToken;
    this.baseUrl = options.baseUrl;
    this.socketFactory = options.socketFactory ?? createDefaultSocket;
    this.onStatusChange = options.onStatusChange;
    this.onJoined = options.onJoined;
    this.onMessage = options.onMessage;
    this.onError = options.onError;
  }

  connect() {
    if (this.disposed) return;
    if (!this.appointmentId) {
      this.emitStatus('error');
      this.emitError(new Error('appointmentId is required'));
      return;
    }
    if (!this.accessToken) {
      this.emitStatus('auth_error');
      this.emitError(new Error('Access token is required for realtime consultation.'));
      return;
    }

    this.disconnectSocket();
    this.emitStatus('connecting');

    const socket = this.socketFactory(
      `${normalizeBaseUrl(this.baseUrl)}${CONSULTATION_SOCKET_NAMESPACE}`,
      {
        auth: { token: this.accessToken },
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: true,
      }
    );

    this.socket = socket;
    socket.on('connect', this.handleConnect);
    socket.on('disconnect', this.handleDisconnect);
    socket.on('connect_error', this.handleConnectError);
    socket.on(CONSULTATION_SOCKET_EVENTS.joined, this.handleJoined);
    socket.on(CONSULTATION_SOCKET_EVENTS.message, this.handleMessage);
    socket.connect();
  }

  sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      this.emitError(new Error('content is required'));
      return false;
    }
    if (!this.socket?.connected || !this.joined) {
      this.emitError(new Error('Realtime consultation socket is not connected.'));
      return false;
    }

    this.socket.emit(CONSULTATION_SOCKET_EVENTS.message, {
      appointmentId: this.appointmentId,
      content: trimmed,
    });
    return true;
  }

  disconnect() {
    this.disposed = true;
    this.disconnectSocket();
    this.emitStatus('disconnected');
  }

  private joinRequestedRoom() {
    this.socket?.emit(CONSULTATION_SOCKET_EVENTS.join, {
      appointmentId: this.appointmentId,
    });
  }

  private disconnectSocket() {
    if (!this.socket) return;
    this.socket.off('connect', this.handleConnect);
    this.socket.off('disconnect', this.handleDisconnect);
    this.socket.off('connect_error', this.handleConnectError);
    this.socket.off(CONSULTATION_SOCKET_EVENTS.joined, this.handleJoined);
    this.socket.off(CONSULTATION_SOCKET_EVENTS.message, this.handleMessage);
    this.socket.disconnect();
    this.socket = null;
    this.joined = false;
  }

  private emitStatus(status: ConsultationSocketStatus) {
    this.onStatusChange?.(status);
  }

  private emitError(error: Error) {
    this.onError?.(error);
  }
}
