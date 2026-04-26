# SPEC.md — VPN Client App (Hiddify/v2rayNG-like)

## Overview
Кроссплатформенное мобильное приложение для Android и iOS, реализующее VPN-клиент с поддержкой протоколов v2ray/Xray (VMess, VLESS, Shadowsocks, Trojan). 

**В рамках текущей среды реализуется:**
- Полный UI/UX с React Native (Expo)
- Управление конфигурациями (CRUD)
- Импорт/экспорт конфигураций (ссылки, QR-коды)
- Состояние подключения (заглушка VPN-сервиса)
- Настройки приложения
- Логи и статистика

**Требует дальнейшей нативной разработки:**
- Нативные VPN-туннели (iOS NetworkExtension / Android VpnService)
- Интеграция с xray-core/v2ray-core

## Tech Stack
- **Framework**: React Native with Expo SDK ~50
- **Navigation**: React Navigation (stack + bottom tabs)
- **State**: React Context + useReducer
- **Storage**: AsyncStorage
- **QR Scanning**: expo-camera
- **Icons**: @expo/vector-icons (Ionicons)
- **Styling**: StyleSheet (нет необходимости в дополнительных UI-китах)

## Architecture

```
App/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── ConnectionButton.tsx    # Большая кнопка подключения
│   │   ├── ConfigCard.tsx          # Карточка конфигурации
│   │   ├── ServerForm.tsx          # Форма добавления/редактирования
│   │   ├── QRScanner.tsx           # Компонент сканирования QR
│   │   ├── LogItem.tsx             # Элемент лога
│   │   └── StatCard.tsx            # Карточка статистики
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Главный экран (статус + кнопка)
│   │   ├── ConfigsScreen.tsx       # Список конфигураций
│   │   ├── ConfigDetailScreen.tsx  # Детали/редактирование
│   │   ├── AddConfigScreen.tsx     # Добавление (ручное/QR/ссылка)
│   │   ├── LogsScreen.tsx          # Логи подключения
│   │   ├── SettingsScreen.tsx      # Настройки
│   │   └── StatsScreen.tsx         # Статистика
│   ├── context/
│   │   ├── AppContext.tsx          # Глобальное состояние
│   │   └── VPNContext.tsx          # Состояние VPN (заглушка)
│   ├── services/
│   │   ├── configParser.ts         # Парсинг ссылок vmess://, vless://, ss://, trojan://
│   │   ├── configExporter.ts       # Экспорт конфигураций
│   │   ├── vpnService.ts           # VPN сервис (заглушка для демо)
│   │   └── storage.ts              # Обёртка над AsyncStorage
│   ├── types/
│   │   └── index.ts                # TypeScript типы
│   └── utils/
│       ├── constants.ts            # Константы
│       └── helpers.ts              # Вспомогательные функции
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## Data Models

### ServerConfig
```typescript
type Protocol = 'vmess' | 'vless' | 'shadowsocks' | 'trojan';

interface ServerConfig {
  id: string;
  name: string;
  protocol: Protocol;
  server: string;           // IP или домен
  port: number;
  uuid?: string;            // Для VMess/VLESS
  password?: string;        // Для SS/Trojan
  method?: string;          // Для SS (aes-256-gcm и т.д.)
  alterId?: number;         // Для VMess
  security?: string;         // tls/none
  network?: string;          // tcp/ws/grpc
  path?: string;             // WebSocket path
  host?: string;             // SNI/Host
  remark?: string;           // Примечание
  createdAt: number;
  isActive: boolean;
}
```

### VPNState
```typescript
interface VPNState {
  status: 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';
  currentConfigId: string | null;
  downloadSpeed: number;    // bytes/sec
  uploadSpeed: number;      // bytes/sec
  duration: number;         // seconds
  lastError: string | null;
}
```

### AppSettings
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoConnect: boolean;
  bypassLan: boolean;
  dns: string;
  mtu: number;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  language: string;
}
```

## Interface Contracts

### configParser.ts
- `parseVmessLink(link: string): ServerConfig | null`
- `parseVlessLink(link: string): ServerConfig | null`
- `parseSsLink(link: string): ServerConfig | null`
- `parseTrojanLink(link: string): ServerConfig | null`
- `parseAnyLink(link: string): ServerConfig | null` — автоопределение протокола
- `configToLink(config: ServerConfig): string` — обратная генерация ссылки

### vpnService.ts (заглушка)
- `connect(config: ServerConfig): Promise<void>` — имитирует подключение
- `disconnect(): Promise<void>` — имитирует отключение
- `getStatus(): VPNState` — возвращает текущее состояние
- `onStatusChange(callback): () => void` — подписка на изменения

### storage.ts
- `saveConfigs(configs: ServerConfig[]): Promise<void>`
- `loadConfigs(): Promise<ServerConfig[]>`
- `saveSettings(settings: AppSettings): Promise<void>`
- `loadSettings(): Promise<AppSettings>`
- `saveLogs(logs: LogEntry[]): Promise<void>`
- `loadLogs(): Promise<LogEntry[]>`

## Screen Flow

1. **HomeScreen**: 
   - Статус подключения (большой индикатор)
   - Кнопка Connect/Disconnect
   - Текущая конфигурация (карточка)
   - Скорость/статистика (если подключено)

2. **ConfigsScreen**:
   - Список всех конфигураций
   - Swipe для удаления
   - Radio button для выбора активной
   - FAB для добавления новой

3. **AddConfigScreen**:
   - Tabs: "Вручную" / "QR-код" / "Из ссылки" / "Из буфера"
   - Форма с полями по протоколу
   - Предпросмотр после парсинга

4. **ConfigDetailScreen**:
   - Все поля конфигурации
   - Кнопки: Редактировать, Удалить, Поделиться (QR + текст)

5. **LogsScreen**:
   - Scrollable список логов
   - Фильтр по уровню
   - Кнопка очистки

6. **SettingsScreen**:
   - Тема
   - Auto-connect
   - Bypass LAN
   - DNS
   - MTU
   - Язык
   - О приложении

7. **StatsScreen**:
   - Графики трафика (если есть данные)
   - Время подключения
   - Общий трафик

## Design Guidelines
- Цветовая схема: тёмная по умолчанию (как Hiddify), с переключением
- Акцентный цвет: зелёный (#4CAF50) для подключено, красный (#F44336) для отключено, жёлтый (#FFC107) для подключения
- Шрифт: системный
- Иконки: Ionicons
- Анимации: простые (opacity, scale) через Animated API

## Navigation Structure
```
Bottom Tabs:
├── Home (Stack: Home -> ConfigSelect)
├── Configs (Stack: ConfigList -> AddConfig -> ConfigDetail)
├── Stats (Stack: Stats)
├── Logs (Stack: Logs)
└── Settings (Stack: Settings)
```

## VPN Service Stub Behavior
Для демонстрации без нативных модулей:
1. При нажатии Connect:
   - Статус меняется на 'connecting' (2-3 секунды)
   - Затем 'connected'
   - Генерируются фейковые скорости (random bytes/sec)
   - Таймер увеличивает duration
2. При нажатии Disconnect:
   - Статус 'disconnecting' (1 секунда)
   - Затем 'disconnected'
   - Скорости сбрасываются
3. Генерируются фейковые логи при подключении

## Build Requirements
- Expo SDK ~50
- eas.json для сборки
- Android: compileSdkVersion 34, minSdk 21
- iOS: deploymentTarget 13.4

## Known Limitations (Future Work)
- Нативные VPN-модули требуют eject из Expo или custom dev client
- iOS: NetworkExtension с NEPacketTunnelProvider
- Android: VpnService + xray-core через JNI/Go Mobile
- Реальная интеграция с xray-core требует Go-модуля
