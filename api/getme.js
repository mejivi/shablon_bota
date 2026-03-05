const TOKEN = process.env.BOT_TOKEN || '8322765545:AAF2O--N6SuBLCW6VgZDAvrRu4DB29tFwBQ';
const API_URL = `https://api.telegram.org/bot${TOKEN}`;

export default async function handler(req, res) {
  try {
    // Получаем последние обновления
    const response = await fetch(`${API_URL}/getUpdates?limit=10`);
    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
}
