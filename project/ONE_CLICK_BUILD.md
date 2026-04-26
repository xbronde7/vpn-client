# VPN Client — Сборка установщиков (Один клик)

## Что ты получишь

| Платформа | Формат | Как скачать |
|-----------|--------|-------------|
| **Android** | `.apk` | GitHub Actions → Artifacts |
| **Windows** | `.exe` (инсталлятор) | GitHub Actions → Artifacts |
| **macOS** | `.dmg` | GitHub Actions → Artifacts |
| **Linux** | `.AppImage` | GitHub Actions → Artifacts |
| **Web** | Сайт | GitHub Pages (автоматически) |

## Шаг 1: Загрузи код на GitHub

1. Открой https://github.com/new
2. Имя репозитория: `vpn-client-app`
3. **ВАЖНО:** поставь галочку **Private** (чтобы никто не видел твои конфиги)
4. **НЕ добавляй** README, .gitignore или license
5. Нажми **Create repository**

6. В терминале (или GitHub Desktop):
```bash
# Распакуй vpn-client-app.zip
cd vpn-client-app

git init
git add -A
git commit -m "Initial commit"

git remote add origin https://github.com/ТВОЙ_НИК/vpn-client-app.git
git push -u origin main
```

## Шаг 2: Получи Expo токен (для Android APK)

1. Зайди на https://expo.dev/signup (регистрация 1 минута)
2. Перейди в **Settings → Access Tokens**
3. Нажми **Create** → скопируй токен

## Шаг 3: Добавь секреты в GitHub

В своём репозитории на GitHub:
1. **Settings** (вкладка вверху)
2. **Secrets and variables → Actions**
3. **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: токен из шага 2
6. **Add secret**

## Шаг 4: Запусти сборку

1. В репозитории перейди во вкладку **Actions**
2. Слева увидишь workflow **"Build All Platforms"**
3. Нажми **Run workflow** (справа, зелёная кнопка)
4. Нажми зелёную кнопку **Run workflow**

## Шаг 5: Скачай установщики

Через **15-20 минут** всё соберётся автоматически:

1. Открой вкладку **Actions**
2. Нажми на последний запуск (зелёная галочка)
3. Прокрути вниз до **Artifacts**
4. Скачай:
   - `android-apk` — установи на телефон
   - `windows-installer` — запусти .exe
   - `macos-dmg` — открой .dmg, перетащи в Applications
   - `linux-appimage` — `chmod +x *.AppImage && ./*.AppImage`
   - `github-pages` — веб-версия уже живёт на `https://твой-ник.github.io/vpn-client-app`

## Готово! Клиенты просто:
1. Скачивают файл
2. Устанавливают
3. Вставляют ссылку / подписку
4. Подключаются

## Парсинг ссылок — поддерживается

**VLESS Reality:**
```
vless://uuid@server:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=yandex.ru&fp=chrome&pbk=...&sid=...&spx=%2F&type=tcp&headerType=none#Name
```

**Подписка URL:**
```
https://example.com/sub/example-token
```

## Уведомления всем пользователям

Для push-рассылки всем клиентам:
1. Используй сервис **OneSignal** (бесплатно до 10k)
2. Или настрой свой бэкенд с **Firebase Admin SDK**
3. В приложении уже есть `NotificationService.sendPushToAll({ title, body })`

## Что включено
- VLESS / VMess / Shadowsocks / Trojan
- XTLS Reality (pbk, sid, fp, spx, flow, sni, headerType, encryption)
- Загрузка подписок по URL
- QR сканер / экспорт
- Split Tunneling (выбор приложений)
- Скрытые IP серверов
- Push-уведомления
