# VPN Client

Cross-platform VPN client prototype:

- `project/` - Expo React Native app for Android and iOS.
- `desktop/` - Electron desktop app for Windows, macOS, and Linux.

The desktop app can bundle Xray/V2Ray Windows cores for local desktop builds. The iOS app cannot use Windows `.exe` cores; App Store distribution requires a native iOS VPN implementation with Network Extension.

## Desktop

```powershell
.\scripts\download-cores.ps1
cd desktop
npm install
npm run build:win
```

## Mobile

```powershell
cd project
npm install
npx expo start
```

## iOS App Store

See [APP_STORE.md](APP_STORE.md).

## GitHub

This repository is prepared for public GitHub publishing. Large generated outputs, downloaded cores, archives, credentials, and `node_modules` are ignored.
