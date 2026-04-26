import { AppSettings } from '../types';

export const COLORS = {
  background: '#1a1a2e',
  surface: '#16213e',
  surfaceLight: '#0f3460',
  primary: '#e94560',
  primaryLight: '#ff6b6b',
  accent: '#533483',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  text: '#eaeaea',
  textSecondary: '#a0a0a0',
  textMuted: '#6c6c6c',
  border: '#2a2a4a',
  white: '#ffffff',
  black: '#000000',
};

export const FONTS = {
  small: 12,
  medium: 14,
  regular: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 28,
  huge: 36,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
};

export const DEFAULT_SPLIT_TUNNEL = {
  mode: 'all' as const,
  apps: [] as any[],
  isEnabled: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoConnect: false,
  bypassLan: true,
  dns: '1.1.1.1',
  mtu: 1500,
  logLevel: 'info',
  language: 'ru',
  splitTunnel: DEFAULT_SPLIT_TUNNEL,
};

export const DEFAULT_VPN_STATE = {
  status: 'disconnected' as const,
  currentConfigId: null,
  downloadSpeed: 0,
  uploadSpeed: 0,
  duration: 0,
  lastError: null,
};
