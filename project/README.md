# VPN Client App — Все платформы

Кроссплатформенное VPN-приложение для **Android**, **iOS**, **Windows**, **macOS**, **Linux** и **Web**.

## 🌐 Платформы

| Платформа | Статус | Стек |
|-----------|--------|------|
| **Android** | ✅ UI готов | React Native + Expo |
| **iOS** | ✅ UI готов | React Native + Expo |
| **Windows** | ✅ UI готов | Electron |
| **macOS** | ✅ UI готов | Electron |
| **Linux** | ✅ UI готов | Electron |
| **Web** | ✅ Демо онлайн | Vanilla JS |

## 🚀 Демо

**[Открыть веб-демо →](https://paoxohvy4gpaq.kimi.show)**

## 📥 Поддерживаемые ссылки

### Тип 1 — Прямая VLESS ссылка
```
vless://00000000-0000-4000-8000-000000000000@example.com:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=example.com&fp=chrome&pbk=examplePublicKey&sid=exampleSid&spx=%2F&type=tcp&headerType=none#Example-Reality
```

### Тип 2 — Ссылка подписки
```
https://example.com/sub/example-token
```

## ✅ Функциональность

- **Протоколы:** VLESS, VMess, Shadowsocks, Trojan
- **XTLS Reality:** pbk, sid, fp, spx, flow, sni, headerType, encryption
- **Подписки:** Загрузка по URL (base64 / plain text)
- **QR:** Сканирование и генерация
- **Split Tunneling:** Выбор приложений для/без VPN
- **Скрытые IP:** Сервер скрыт в списке (••••••••)
- **Уведомления:** Push при подключении/отключении
- **Логи:** Фильтрация по уровням
- **Статистика:** Трафик, время сессии

## 📁 Структура проекта

```
vpn-client-app/
├── 📱 Mobile (React Native)
│   ├── App.tsx
│   ├── src/
│   │   ├── screens/        # Все экраны
│   │   ├── components/     # UI компоненты
│   │   ├── context/         # Состояние
│   │   ├── services/
│   │   │   ├── configParser.ts    # Парсинг ссылок
│   │   │   ├── vpnService.ts      # VPN stub
│   │   │   ├── storage.ts         # AsyncStorage
│   │   │   └── notificationService.ts  # Уведомления
│   │   └── types/
│   └── package.json
│
├── 🖥️ Desktop (Electron)
│   └── desktop/
│       ├── main.js         # Electron main
│       ├── preload.js      # IPC
│       ├── web/            # UI
│       └── package.json
│
└── 🌐 Web Demo
    └── web-demo/
        └── index.html
```

## 🛠 Быстрый старт

### Mobile (Android / iOS)
```bash
cd vpn-client-app
npm install
npx expo start
```

### Desktop (Windows / macOS / Linux)
```bash
cd desktop
npm install
npm start          # dev
npm run build:win  # .exe
npm run build:mac  # .dmg
npm run build:linux # .AppImage
```

## 📦 Сборка APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Или через **GitHub Actions** — уже настроен `.github/workflows/build-apk.yml`. Добавь `EXPO_TOKEN` в Secrets.

## 🔔 Уведомления

### Для всех пользователей (Push)
Для реальной отправки push всем пользователям требуется:
1. Firebase проект + FCM Admin SDK
2. Бэкенд (Node.js / Python) для рассылки
3. Или использовать сервис вроде OneSignal

В текущей версии:
- **Мобильные:** `expo-notifications` — локальные уведомления
- **Desktop:** Electron Notification API — нативные уведомления ОС
- **Web:** Notification API — браузерные уведомления

### Включить уведомления
```javascript
await NotificationService.requestPermissions();
await NotificationService.notifyConnected('My Server');
await NotificationService.sendPushToAll({
  title: 'Новый сервер',
  body: 'Добавлен сервер Yandex-Reality'
});
```

## ⚠️ Важно

Это **UI-демо**. Для реального VPN-туннелирования требуется интеграция нативных модулей:
- **Android:** `VpnService` + xray-core (Go Mobile)
- **iOS:** `NetworkExtension` (NEPacketTunnelProvider) + xray-core
- **Desktop:** Прокси через системный tun/tap или xray-core CLI

## 📄 Лицензия

MIT
