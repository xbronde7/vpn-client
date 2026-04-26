import { useState, useCallback } from 'react';
import { ServerConfig, VPNState, LogEntry } from '../types';
import { DEFAULT_VPN_STATE } from '../utils/constants';

let currentState: VPNState = { ...DEFAULT_VPN_STATE };
let listeners: Array<(state: VPNState) => void> = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let durationInterval: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach(cb => cb({ ...currentState }));
}

export const VPNService = {
  getState(): VPNState {
    return { ...currentState };
  },

  subscribe(callback: (state: VPNState) => void): () => void {
    listeners.push(callback);
    callback({ ...currentState });
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  },

  async connect(config: ServerConfig): Promise<void> {
    if (currentState.status === 'connected' || currentState.status === 'connecting') {
      return;
    }

    currentState = {
      ...currentState,
      status: 'connecting',
      currentConfigId: config.id,
      lastError: null,
    };
    notify();

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    currentState = {
      ...currentState,
      status: 'connected',
      downloadSpeed: 0,
      uploadSpeed: 0,
      duration: 0,
    };
    notify();

    // Start traffic simulation
    intervalId = setInterval(() => {
      currentState = {
        ...currentState,
        downloadSpeed: Math.floor(Math.random() * 5000000),
        uploadSpeed: Math.floor(Math.random() * 500000),
      };
      notify();
    }, 1000);

    // Start duration counter
    durationInterval = setInterval(() => {
      currentState = {
        ...currentState,
        duration: currentState.duration + 1,
      };
      notify();
    }, 1000);
  },

  async disconnect(): Promise<void> {
    if (currentState.status === 'disconnected' || currentState.status === 'disconnecting') {
      return;
    }

    currentState = {
      ...currentState,
      status: 'disconnecting',
    };
    notify();

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (durationInterval) {
      clearInterval(durationInterval);
      durationInterval = null;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    currentState = {
      ...DEFAULT_VPN_STATE,
    };
    notify();
  },

  generateLogs(config: ServerConfig): LogEntry[] {
    const now = Date.now();
    return [
      { id: `log-${now}-1`, timestamp: now, level: 'info', message: `Starting connection to ${config.server}:${config.port}`, tag: 'VPN' },
      { id: `log-${now}-2`, timestamp: now + 100, level: 'info', message: `Protocol: ${config.protocol.toUpperCase()}`, tag: 'VPN' },
      { id: `log-${now}-3`, timestamp: now + 300, level: 'info', message: 'Handshake initiated', tag: 'VPN' },
      { id: `log-${now}-4`, timestamp: now + 800, level: 'info', message: 'TLS handshake completed', tag: 'TLS' },
      { id: `log-${now}-5`, timestamp: now + 1200, level: 'info', message: 'Connection established successfully', tag: 'VPN' },
      { id: `log-${now}-6`, timestamp: now + 1500, level: 'info', message: `Routing through ${config.server}`, tag: 'ROUTING' },
    ];
  },
};
