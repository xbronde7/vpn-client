// Notification service abstraction for all platforms
// Web: Notification API + Firebase
// Desktop: Electron ipcRenderer
// Mobile: expo-notifications

import { Platform } from 'react-native';

let pushToken: string | null = null;

export const NotificationService = {
  // Request permissions (mobile only)
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      if (!('Notification' in window)) return false;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    // For native (Expo), would use expo-notifications.requestPermissionsAsync()
    // But in stub, just return true
    return true;
  },

  // Show local notification
  async showNotification({
    title,
    body,
    data = {},
  }: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> {
    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.png' });
      }
      return;
    }

    // Desktop Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI?.showNotification) {
      await (window as any).electronAPI.showNotification({ title, body });
      return;
    }

    // Mobile (Expo) - stub
    console.log('[NOTIFICATION]', title, body, data);
  },

  // Send push to all users (requires FCM backend)
  async sendPushToAll({
    title,
    body,
  }: {
    title: string;
    body: string;
  }): Promise<boolean> {
    // In a real app, this would call your backend API which then uses FCM Admin SDK
    // to broadcast to all registered device tokens
    // Example backend endpoint: POST /api/broadcast
    try {
      // Demo: just show local notification
      await this.showNotification({ title, body });
      return true;
    } catch {
      return false;
    }
  },

  // Schedule notification (mobile)
  async scheduleNotification({
    title,
    body,
    seconds = 0,
  }: {
    title: string;
    body: string;
    seconds?: number;
  }): Promise<void> {
    if (Platform.OS === 'web') {
      setTimeout(() => this.showNotification({ title, body }), seconds * 1000);
      return;
    }
    // Native: expo-notifications.scheduleNotificationAsync
    setTimeout(() => this.showNotification({ title, body }), seconds * 1000);
  },

  // Set push token (called on app start)
  setPushToken(token: string | null) {
    pushToken = token;
    console.log('Push token:', token);
  },

  getPushToken(): string | null {
    return pushToken;
  },

  // VPN status notification helpers
  async notifyConnected(serverName: string): Promise<void> {
    await this.showNotification({
      title: 'VPN подключен',
      body: `Подключено к ${serverName}`,
    });
  },

  async notifyDisconnected(): Promise<void> {
    await this.showNotification({
      title: 'VPN отключен',
      body: 'Соединение завершено',
    });
  },

  async notifyError(message: string): Promise<void> {
    await this.showNotification({
      title: 'Ошибка VPN',
      body: message,
    });
  },
};
