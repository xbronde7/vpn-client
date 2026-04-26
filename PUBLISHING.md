# Publishing

## GitHub

1. Log in:

```powershell
gh auth login
```

2. Create a public repository and push:

```powershell
gh repo create vpn-client --public --source . --remote origin --push
```

If the repository already exists:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/vpn-client.git
git push -u origin main
```

## GitHub Actions

The root `.github/workflows/build.yml` workflow builds:

- Windows desktop installer.
- Mobile TypeScript check.

The root `.github/workflows/eas-ios.yml` workflow builds and submits iOS through EAS. It requires the `EXPO_TOKEN` repository secret and App Store credentials configured through EAS.

## Desktop Core Downloads

Xray/V2Ray Windows binaries are intentionally not committed. Run:

```powershell
.\scripts\download-cores.ps1
```

The script downloads official release archives, verifies SHA-256 from `.dgst`, and places files in `desktop/bin`.
