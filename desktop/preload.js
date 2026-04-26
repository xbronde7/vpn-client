const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: ({ title, body }) => ipcRenderer.invoke('show-notification', { title, body }),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  connectVpn: (payload) => ipcRenderer.invoke('vpn-connect', payload),
  disconnectVpn: () => ipcRenderer.invoke('vpn-disconnect'),
  getVpnStatus: () => ipcRenderer.invoke('vpn-status'),
  onTrayConnect: (callback) => ipcRenderer.on('tray-connect', callback),
  onTrayDisconnect: (callback) => ipcRenderer.on('tray-disconnect', callback),
});
