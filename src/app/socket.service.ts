import { Injectable } from '@angular/core';
import type { AgentLiveSchema } from './interfaces/AgentConfig.js';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: WebSocket | null = null;

  private listeners: Record<string, ((data: any) => void)[]> = {};

  constructor() {
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  public disconnect(): void {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }
    this.socket?.close();
    this.socket = null;
  }
  public connect(key: string): void {
    if (this.socket) {
      throw new Error("Socket is already connected");
    }
    if (!key) {
      throw new Error("API key is required");
    }
    this.socket = new WebSocket('wss://agent.deepgram.com/v1/agent/converse', ["token", key]);
    this.socket.onopen = () => {
      if (this.listeners["open"]) {
        this.listeners["open"].forEach((callback) => {
          callback({ type: "open" });
        });
        return;
      }
      console.log('WebSocket connection opened');
    }
    this.socket.onmessage = (event) => {
      if (event.data instanceof Blob) {
        if (this.listeners["Audio"]) {
          this.listeners["Audio"].forEach((callback) => {
            callback(event.data);
          });
          console.log("Handling audio event");
          return;
        }
        console.log("Unhandled audio event");
        return;
      }
      const { type } = JSON.parse(event.data);
      if (this.listeners[type]) {
        console.log(`Handling event type: ${type}`);
        this.listeners[type].forEach((callback) => {
          callback(event.data);
        });
        return;
      }
      console.log("Unhandled event type: ", type);
    }
    this.socket.onclose = () => {
      if (this.listeners["close"]) {
        this.listeners["close"].forEach((callback) => {
          callback({ type: "close" });
        });
        return;
      }
      console.log('WebSocket connection closed');
    }
    this.socket.onerror = (error) => {
      if (this.listeners["error"]) {
        this.listeners["error"].forEach((callback) => {
          callback({ type: "error", error });
        });
        return;
      }
      console.error('WebSocket error: ', error);
    }
  }

  public configure(config: AgentLiveSchema): void {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }
    // Implement the logic to configure the socket connection
    // For example, using WebSocket or any other library
    this.socket.send(JSON.stringify(config));
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public sendAudio(audio: ArrayBuffer): void {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }
    this.socket.send(audio);
  }



  public keepAlive(): void {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }
    this.socket.send(JSON.stringify({ type: "KeepAlive" }));
  }
}
