# Roblox Telegram Bot

Telegram бот для обхода блокировок Roblox с системой подписок на каналы.

## Установка

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Создайте `.env` файл на основе `.env.example`
4. Получите токен бота у @BotFather
5. Добавьте токен в `.env`

## Деплой на Vercel

1. Установите Vercel CLI: `npm i -g vercel`
2. Войдите: `vercel login`
3. Задеплойте: `vercel --prod`
4. Установите переменные окружения в Vercel:
   - BOT_TOKEN
   - ANALYTICS_CHAT_ID
5. Установите вебхук: 
   ```
   curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
   -H "Content-Type: application/json" \
   -d '{"url": "https://your-vercel-domain.vercel.app/api/webhook"}'
   ```

## Функционал

- 5-шаговый сценарий с фотографиями
- Админка для управления ссылками на каналы (/admin67_67)
- Ежедневная аналитика
- Отслеживание статистики пользователей

## Команды

- `/start` - Начать работу с ботом
- `/admin67_67` - Админ-панель (обновление ссылок на каналы)
