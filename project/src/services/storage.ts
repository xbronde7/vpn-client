import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServerConfig, AppSettings, LogEntry } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

const CONFIGS_KEY = '@vpn_configs';
const SETTINGS_KEY = '@vpn_settings';
const LOGS_KEY = '@vpn_logs';

export const Storage = {
  async saveConfigs(configs: ServerConfig[]): Promise<void> {
    await AsyncStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
  },

  async loadConfigs(): Promise<ServerConfig[]> {
    const data = await AsyncStorage.getItem(CONFIGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  async loadSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  async saveLogs(logs: LogEntry[]): Promise<void> {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(-500))); // Keep last 500
  },

  async loadLogs(): Promise<LogEntry[]> {
    const data = await AsyncStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async clearLogs(): Promise<void> {
    await AsyncStorage.removeItem(LOGS_KEY);
  },
};
