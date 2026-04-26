const { app, BrowserWindow, ipcMain, Notification, Tray, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let tray;
let vpnSession = {
  status: 'disconnected',
  connectedAt: null,
  config: null,
  routing: null,
  coreFound: false,
};

function getBundledCorePath() {
  const candidates = [
    path.join(__dirname, 'bin', 'xray', 'xray.exe'),
    path.join(__dirname, 'bin', 'v2ray', 'v2ray.exe'),
    path.join(__dirname, 'bin', 'xray.exe'),
    path.join(__dirname, 'bin', 'v2ray.exe'),
    path.join(process.resourcesPath || __dirname, 'bin', 'xray', 'xray.exe'),
    path.join(process.resourcesPath || __dirname, 'bin', 'v2ray', 'v2ray.exe'),
    path.join(process.resourcesPath || __dirname, 'bin', 'xray.exe'),
    path.join(process.resourcesPath || __dirname, 'bin', 'v2ray.exe'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function summarizeRouting(routing = {}) {
  routing = routing || {};
  const sites = Array.isArray(routing.sites) ? routing.sites : [];
  const apps = Array.isArray(routing.apps) ? routing.apps : [];
  return {
    defaultRoute: routing.defaultRoute || 'direct',
    vpnSites: sites.filter((rule) => rule.route === 'vpn').length,
    directSites: sites.filter((rule) => rule.route === 'direct').length,
    vpnApps: apps.filter((rule) => rule.route === 'vpn').length,
    directApps: apps.filter((rule) => rule.route === 'direct').length,
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 430,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: 'VPN Client',
    icon: path.join(__dirname, 'web/assets/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    roundedCorners: true,
    vibrancy: 'sidebar',
    transparent: process.platform === 'darwin',
    backgroundColor: '#050608',
  });

  mainWindow.loadFile(path.join(__dirname, 'web/index.html'));

  tray = new Tray(path.join(__dirname, 'web/assets/icon.png'));
  const trayMenu = Menu.buildFromTemplate([
    { label: 'Открыть', click: () => mainWindow.show() },
    { label: 'Подключиться', click: () => mainWindow.webContents.send('tray-connect') },
    { label: 'Отключиться', click: () => mainWindow.webContents.send('tray-disconnect') },
    { type: 'separator' },
    { label: 'Выход', click: () => app.quit() },
  ]);
  tray.setToolTip('VPN Client');
  tray.setContextMenu(trayMenu);
  tray.on('click', () => {
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin') {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow.show();
});

ipcMain.handle('show-notification', async (event, { title, body }) => {
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, 'web/assets/icon.png'),
  });
  notification.show();
  return true;
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle('vpn-connect', async (event, payload = {}) => {
  const corePath = getBundledCorePath();
  vpnSession = {
    status: 'connected',
    connectedAt: Date.now(),
    config: payload.config || null,
    routing: payload.routing || null,
    coreFound: Boolean(corePath),
    corePath,
  };

  return {
    ok: true,
    status: vpnSession.status,
    connectedAt: vpnSession.connectedAt,
    coreFound: vpnSession.coreFound,
    corePath,
    routingSummary: summarizeRouting(vpnSession.routing),
    engine: corePath ? 'xray-ready' : 'managed-demo',
  };
});

ipcMain.handle('vpn-disconnect', async () => {
  vpnSession = {
    ...vpnSession,
    status: 'disconnected',
    connectedAt: null,
  };
  return { ok: true, status: vpnSession.status };
});

ipcMain.handle('vpn-status', async () => {
  const corePath = getBundledCorePath();
  return {
    ok: true,
    ...vpnSession,
    coreFound: Boolean(corePath),
    corePath,
    engine: corePath ? 'xray-ready' : 'managed-demo',
    routingSummary: summarizeRouting(vpnSession.routing),
  };
});
