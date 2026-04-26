export type Protocol = 'vmess' | 'vless' | 'shadowsocks' | 'trojan';

export interface ServerConfig {
  id: string;
  name: string;
  protocol: Protocol;
  server: string;
  port: number;
  uuid?: string;
  password?: string;
  method?: string;
  alterId?: number;
  security?: string;
  network?: string;
  path?: string;
  host?: string;
  remark?: string;
  createdAt: number;
  isActive: boolean;
  // XTLS-Reality fields
  pbk?: string;           // public key (x25519)
  sid?: string;           // shortId
  fp?: string;            // fingerprint (chrome, firefox, safari, ios, etc.)
  spiderX?: string;        // spiderX path
  flow?: string;          // xtls flow (xtls-rprx-vision, etc.)
  sni?: string;           // server name indicator (separate from host)
  headerType?: string;     // none, http, etc.
  encryption?: string;     // for vless (none)
}

export type SubscriptionType = 'single' | 'subscription';

export interface SubscriptionConfig {
  id: string;
  url: string;
  name: string;
  configs: ServerConfig[];
  lastUpdated: number;
  autoUpdate: boolean;
  updateInterval: number; // hours
}

export type VPNStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface VPNState {
  status: VPNStatus;
  currentConfigId: string | null;
  downloadSpeed: number;
  uploadSpeed: number;
  duration: number;
  lastError: string | null;
}

export type SplitTunnelMode = 'all' | 'whitelist' | 'blacklist';

export interface AppInfo {
  packageName: string;
  name: string;
  icon?: string;  // base64 or uri
  enabled: boolean;
}

export interface SplitTunnelSettings {
  mode: SplitTunnelMode;
  apps: AppInfo[];
  isEnabled: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoConnect: boolean;
  bypassLan: boolean;
  dns: string;
  mtu: number;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  language: string;
  splitTunnel: SplitTunnelSettings;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  tag?: string;
}

export interface TrafficStats {
  totalDownload: number;
  totalUpload: number;
  sessionDownload: number;
  sessionUpload: number;
  connectionCount: number;
}
