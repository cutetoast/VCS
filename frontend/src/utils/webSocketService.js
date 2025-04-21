// WebSocket Service for handling vehicle detection connections

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // Start with 2 seconds
    this.listeners = new Map();
  }

  connect() {
    // Try to use environment variable for WebSocket URL, fallback to localhost
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    
    if (this.socket) {
      this.socket.close();
    }

    console.log(`Connecting to WebSocket at ${wsUrl}`);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000;
      
      // Notify listeners about connection
      this.notifyListeners('connection', { connected: true });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners('message', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code} ${event.reason}`);
      this.isConnected = false;
      this.notifyListeners('connection', { connected: false });
      
      // Try to reconnect
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Exponential backoff for reconnection attempts
      const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1));
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page.');
      this.notifyListeners('maxReconnectAttempts', null);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => this.removeListener(event, callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for event ${event}:`, error);
        }
      });
    }
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService; 