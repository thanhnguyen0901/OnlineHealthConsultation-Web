import { expect, test } from '@playwright/test';
import {
  CONSULTATION_SOCKET_EVENTS,
  ConsultationSocketClient,
  type ConsultationSocketLike,
} from '../../src/features/consultation/realtime/consultationSocketClient';

type Listener = (...args: any[]) => void;

class MockConsultationSocket implements ConsultationSocketLike {
  connected = false;
  connectCalls = 0;
  disconnectCalls = 0;
  emitted: { event: string; payload?: unknown }[] = [];
  private readonly listeners = new Map<string, Set<Listener>>();

  connect() {
    this.connectCalls += 1;
  }

  disconnect() {
    this.connected = false;
    this.disconnectCalls += 1;
  }

  emit(event: string, payload?: unknown) {
    this.emitted.push({ event, payload });
  }

  on(event: string, listener: Listener) {
    const listeners = this.listeners.get(event) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(event, listeners);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  listenerCount(event: string) {
    return this.listeners.get(event)?.size ?? 0;
  }

  fire(event: string, ...args: unknown[]) {
    if (event === 'connect') this.connected = true;
    if (event === 'disconnect') this.connected = false;
    [...(this.listeners.get(event) ?? [])].forEach((listener) => listener(...args));
  }
}

test.describe('ConsultationSocketClient', () => {
  test('authenticates with access token, joins requested room, and sends gateway messages', () => {
    const socket = new MockConsultationSocket();
    const received: unknown[] = [];
    let createdUrl = '';
    let createdOptions: unknown;
    const client = new ConsultationSocketClient({
      appointmentId: 'appointment-1',
      accessToken: 'access-token',
      baseUrl: 'http://localhost:4000',
      socketFactory: (url, options) => {
        createdUrl = url;
        createdOptions = options;
        return socket;
      },
      onMessage: (message) => received.push(message),
    });

    client.connect();
    socket.fire('connect');
    socket.fire(CONSULTATION_SOCKET_EVENTS.joined, {
      appointmentId: 'appointment-1',
      sessionId: 'session-1',
      status: 'ONGOING',
      channel: 'CHAT',
      room: 'consultation:appointment-1',
    });

    expect(createdUrl).toBe('http://localhost:4000/consultations');
    expect(createdOptions).toMatchObject({
      auth: { token: 'access-token' },
      autoConnect: false,
      reconnection: true,
    });
    expect(socket.emitted[0]).toEqual({
      event: CONSULTATION_SOCKET_EVENTS.join,
      payload: { appointmentId: 'appointment-1' },
    });

    expect(client.sendMessage('  hello doctor  ')).toBe(true);
    expect(socket.emitted[1]).toEqual({
      event: CONSULTATION_SOCKET_EVENTS.message,
      payload: { appointmentId: 'appointment-1', content: 'hello doctor' },
    });

    socket.fire(CONSULTATION_SOCKET_EVENTS.message, { id: 'message-1', content: 'reply' });
    socket.fire(CONSULTATION_SOCKET_EVENTS.message, { id: 'message-1', content: 'reply' });
    expect(received).toEqual([{ id: 'message-1', content: 'reply' }]);
  });

  test('rejoins the same appointment room after reconnect', () => {
    const socket = new MockConsultationSocket();
    const statuses: string[] = [];
    const client = new ConsultationSocketClient({
      appointmentId: 'appointment-2',
      accessToken: 'access-token',
      baseUrl: 'http://localhost:4000/',
      socketFactory: () => socket,
      onStatusChange: (status) => statuses.push(status),
    });

    client.connect();
    socket.fire('connect');
    socket.fire('disconnect', 'transport close');
    socket.fire('connect');

    expect(socket.emitted).toEqual([
      { event: CONSULTATION_SOCKET_EVENTS.join, payload: { appointmentId: 'appointment-2' } },
      { event: CONSULTATION_SOCKET_EVENTS.join, payload: { appointmentId: 'appointment-2' } },
    ]);
    expect(statuses).toContain('reconnecting');
  });

  test('cleans up listeners on disconnect', () => {
    const socket = new MockConsultationSocket();
    const received: unknown[] = [];
    const client = new ConsultationSocketClient({
      appointmentId: 'appointment-3',
      accessToken: 'access-token',
      baseUrl: 'http://localhost:4000',
      socketFactory: () => socket,
      onMessage: (message) => received.push(message),
    });

    client.connect();
    expect(socket.listenerCount(CONSULTATION_SOCKET_EVENTS.message)).toBe(1);

    client.disconnect();
    expect(socket.disconnectCalls).toBe(1);
    expect(socket.listenerCount(CONSULTATION_SOCKET_EVENTS.message)).toBe(0);

    socket.fire(CONSULTATION_SOCKET_EVENTS.message, { id: 'message-after-disconnect', content: 'late' });
    expect(received).toEqual([]);
  });

  test('handles missing access token without creating a socket', () => {
    const statuses: string[] = [];
    const errors: string[] = [];
    const client = new ConsultationSocketClient({
      appointmentId: 'appointment-4',
      accessToken: null,
      baseUrl: 'http://localhost:4000',
      socketFactory: () => {
        throw new Error('socket should not be created without access token');
      },
      onStatusChange: (status) => statuses.push(status),
      onError: (error) => errors.push(error.message),
    });

    client.connect();

    expect(statuses).toEqual(['auth_error']);
    expect(errors).toEqual(['Access token is required for realtime consultation.']);
  });
});
