# App Store Submission

This repository contains an Expo React Native iOS app and an Electron desktop app. The Windows Electron app cannot be installed from the iPhone App Store. For iPhone distribution, submit the Expo iOS app from `project/`.

## Requirements

- Apple Developer Program membership.
- App Store Connect app record.
- A unique iOS bundle identifier in `project/app.json`.
- Expo account and EAS CLI.
- For a real VPN on iOS: Network Extension / Packet Tunnel implementation and Apple entitlement approval. The current mobile app UI is not a production iOS VPN tunnel.

Official references:

- Apple Developer Program: https://developer.apple.com/programs/
- App Store Connect build uploads: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- Expo EAS iOS submit: https://docs.expo.dev/submit/ios/
- Apple Network Extension entitlement: https://developer.apple.com/documentation/BundleResources/Entitlements/com.apple.developer.networking.networkextension

## Installed Tools

The machine has:

- `git`
- GitHub CLI: `gh`
- EAS CLI: `eas`
- Node.js / npm

## Login

```powershell
gh auth login
eas login
```

## Configure iOS

Edit `project/app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.vpnclient",
      "buildNumber": "1.0.0"
    }
  }
}
```

Replace `com.yourcompany.vpnclient` with your real App Store bundle ID.

## Build iOS

```powershell
cd project
eas build -p ios --profile production
```

## Submit to App Store Connect

```powershell
cd project
eas submit -p ios --profile production
```

EAS will ask for Apple credentials or App Store Connect API key information.

## Important VPN Note

Apple requires VPN apps to use native iOS networking APIs such as Network Extension. A desktop `xray.exe` or `v2ray.exe` cannot run on iPhone. To ship a real VPN client on iOS, add a native Packet Tunnel Provider target and request the required entitlement from Apple.
