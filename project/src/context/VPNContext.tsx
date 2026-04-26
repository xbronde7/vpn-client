import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { VPNState } from '../types';
import { VPNService } from '../services/vpnService';

interface VPNContextValue {
  state: VPNState;
  refresh: () => void;
}

const VPNContext = createContext<VPNContextValue | null>(null);

export function VPNProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VPNState>(VPNService.getState());

  useEffect(() => {
    return VPNService.subscribe(newState => {
      setState(newState);
    });
  }, []);

  const refresh = useCallback(() => {
    setState(VPNService.getState());
  }, []);

  return (
    <VPNContext.Provider value={{ state, refresh }}>
      {children}
    </VPNContext.Provider>
  );
}

export function useVPN() {
  const context = useContext(VPNContext);
  if (!context) throw new Error('useVPN must be used within VPNProvider');
  return context;
}
