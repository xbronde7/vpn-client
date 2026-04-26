# VPN Client Desktop

Desktop версия VPN Client для **Windows**, **macOS** и **Linux**.

## Стек
- **Electron** — desktop runtime
- **React** (vanilla JS/HTML) — UI (тот же код что и web-demo)

## Быстрый старт

### 1. Установка зависимостей
```bash
cd desktop
npm install
```

### 2. Запуск в режиме разработки
```bash
npm start
```

### 3. Сборка

**Windows (.exe installer):**
```bash
npm run build:win
```

**macOS (.dmg):**
```bash
npm run build:mac
```

**Linux (.AppImage):**
```bash
npm run build:linux
```

**Все платформы сразу:**
```bash
npm run dist
```

Сборки появятся в папке `dist/`.

## Возможности
- 🖥️ Системный трей (сворачивание в иконку)
- 🔔 Нативные уведомления (Windows/macOS/Linux)
- 🔗 Поддержка vless://, vmess://, ss://, trojan://
- 🔑 XTLS Reality (pbk, sid, fp, spx, flow)
- 📥 Загрузка подписок по URL
- 👁️ Скрытые IP серверов
- 🔒 Избирательное туннелирование (Split Tunneling)

## Структура
```
desktop/
├── main.js           # Electron main process
├── preload.js        # IPC bridge (Notifications, Tray)
├── package.json      # Electron + builder config
└── web/              # UI (копия web-demo)
    ├── index.html
    └── assets/
```

## Уведомления
При подключении/отключении VPN показывается нативное уведомление ОС.

## Примечание
Это UI-демо. Для реального VPN-туннелирования требуется интеграция с xray-core через нативные модули Node.js или Rust.
