import { Bot } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.BOT_TOKEN || '8322765545:AAF2O--N6SuBLCW6VgZDAvrRu4DB29tFwBQ';
const bot = new Bot(TOKEN);

bot.on('message:photo', async (ctx) => {
  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  await ctx.reply(`File ID:\n\`${photo.file_id}\``, {
    parse_mode: 'Markdown'
  });
  console.log('Photo file_id:', photo.file_id);
});

bot.command('start', async (ctx) => {
  await ctx.reply('Отправьте мне 5 фотографий по очереди, и я дам вам их file_id');
});

await bot.api.deleteWebhook();
console.log('Бот запущен. Отправьте фотографии боту, чтобы получить их file_id');
bot.start();
