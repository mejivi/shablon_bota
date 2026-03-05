# MongoDB Atlas Setup

## 1. Создание кластера
- Зайдите на https://cloud.mongodb.com
- Создайте бесплатный кластер (M0)
- Выберите регион (рекомендуется ближайший к Vercel)

## 2. Настройка доступа
- Database Access: создайте пользователя с правами readWrite
- Network Access: добавьте 0.0.0.0/0 (для Vercel)

## 3. Получение URI
- Нажмите "Connect" → "Connect your application"
- Скопируйте connection string
- Замените <password> на ваш пароль

## 4. Переменные окружения
Добавьте в Vercel:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=roblox_bot
BOT_TOKEN=your_bot_token
ANALYTICS_CHAT_ID=your_chat_id
```

## 5. Структура БД
Коллекции создаются автоматически:
- `settings` - хранит ссылки на каналы
- `analytics` - события пользователей
- `users` - уникальные пользователи

## 6. Индексы (опционально)
```javascript
db.analytics.createIndex({ userId: 1, action: 1 })
db.analytics.createIndex({ date: 1 })
db.users.createIndex({ lastSeen: -1 })
```
