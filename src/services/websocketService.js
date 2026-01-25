import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnected, onError) {
    if (this.connected && this.stompClient?.connected) {
      if (onConnected) onConnected();
      return;
    }

    // Connect directly to backend WebSocket endpoint
    // Note: Backend must allow CORS for this to work
    // If CORS is not enabled, ask backend developer to add it
    const wsUrl = 'https://hyperactively-florescent-addilyn.ngrok-free.dev/ws-chat';
    console.log('Connecting to WebSocket:', wsUrl);
    
    const socket = new SockJS(wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP:', str);
      },
      onConnect: (frame) => {
        console.log('WebSocket Connected:', frame);
        this.connected = true;
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log('WebSocket Closed');
        this.connected = false;
      },
    });

    this.stompClient.activate();
  }

  subscribe(sessionId, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const topic = `/topic/chat/${sessionId}`;
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(sessionId, subscription);
    return subscription;
  }

  unsubscribe(sessionId) {
    const subscription = this.subscriptions.get(sessionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(sessionId);
    }
  }

  disconnect() {
    // Unsubscribe from all topics
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.connected = false;
  }

  isConnected() {
    return this.connected && this.stompClient?.connected;
  }
}

export default new WebSocketService();

