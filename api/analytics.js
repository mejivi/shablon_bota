import { getStats, getAllUsersCount } from '../lib/storage.js';

const TOKEN = process.env.BOT_TOKEN || '8322765545:AAF2O--N6SuBLCW6VgZDAvrRu4DB29tFwBQ';
const API_URL = `https://api.telegram.org/bot${TOKEN}`;
const ANALYTICS_CHAT_ID = process.env.ANALYTICS_CHAT_ID || '-5289333953';

async function sendMessage(chatId, text) {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
  return response.json();
}

export default async function handler(req, res) {
  try {
    const stats = await getStats();
    const usersCount = await getAllUsersCount();
    const today = new Date().toISOString().split('T')[0];
    const todayStats = stats.daily[today] || { starts: 0, accessClicks: 0, subscribeClicks: 0 };
    
    const message = `📊 *Аналитика за ${today}*\n\n` +
      `👥 Уникальных пользователей: ${usersCount}\n\n` +
      `1. Кол-во прожали /start ВСЕГО: ${stats.totalStarts} (сегодня: ${todayStats.starts})\n` +
      `2. Нажали кнопку Получить доступ ВСЕГО: ${stats.totalAccessClicks} (сегодня: ${todayStats.accessClicks})\n` +
      `3. Нажали кнопку Подписаться на каналы ВСЕГО: ${stats.totalSubscribeClicks} (сегодня: ${todayStats.subscribeClicks})`;
    
    await sendMessage(ANALYTICS_CHAT_ID, message);
    
    return res.status(200).json({ ok: true, message: 'Analytics sent' });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error.message });
  }
}
