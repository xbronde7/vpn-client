import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ServerConfig, AppSettings, LogEntry, SplitTunnelSettings } from '../types';
import { Storage } from '../services/storage';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface AppState {
  configs: ServerConfig[];
  settings: AppSettings;
  logs: LogEntry[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_CONFIGS'; configs: ServerConfig[] }
  | { type: 'ADD_CONFIG'; config: ServerConfig }
  | { type: 'UPDATE_CONFIG'; config: ServerConfig }
  | { type: 'DELETE_CONFIG'; id: string }
  | { type: 'SET_ACTIVE_CONFIG'; id: string }
  | { type: 'SET_SETTINGS'; settings: AppSettings }
  | { type: 'SET_SPLIT_TUNNEL'; splitTunnel: SplitTunnelSettings }
  | { type: 'ADD_LOGS'; logs: LogEntry[] }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_LOADING'; isLoading: boolean };

const initialState: AppState = {
  configs: [],
  settings: DEFAULT_SETTINGS,
  logs: [],
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONFIGS':
      return { ...state, configs: action.configs };
    case 'ADD_CONFIG':
      return { ...state, configs: [...state.configs, action.config] };
    case 'UPDATE_CONFIG':
      return {
        ...state,
        configs: state.configs.map(c => c.id === action.config.id ? action.config : c),
      };
    case 'DELETE_CONFIG':
      return {
        ...state,
        configs: state.configs.filter(c => c.id !== action.id),
      };
    case 'SET_ACTIVE_CONFIG':
      return {
        ...state,
        configs: state.configs.map(c => ({ ...c, isActive: c.id === action.id })),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'SET_SPLIT_TUNNEL':
      return {
        ...state,
        settings: { ...state.settings, splitTunnel: action.splitTunnel },
      };
    case 'ADD_LOGS':
      return { ...state, logs: [...state.logs, ...action.logs] };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function load() {
      const [configs, settings, logs] = await Promise.all([
        Storage.loadConfigs(),
        Storage.loadSettings(),
        Storage.loadLogs(),
      ]);
      dispatch({ type: 'SET_CONFIGS', configs });
      if (settings) {
        dispatch({ type: 'SET_SETTINGS', settings: { ...DEFAULT_SETTINGS, ...settings, splitTunnel: { ...DEFAULT_SETTINGS.splitTunnel, ...settings?.splitTunnel } } });
      }
      dispatch({ type: 'ADD_LOGS', logs });
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
    load();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      Storage.saveConfigs(state.configs);
    }
  }, [state.configs, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      Storage.saveSettings(state.settings);
    }
  }, [state.settings, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      Storage.saveLogs(state.logs);
    }
  }, [state.logs, state.isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
