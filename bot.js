import { Bot, InlineKeyboard } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN || '8322765545:AAF2O--N6SuBLCW6VgZDAvrRu4DB29tFwBQ');

bot.catch((err) => {
  console.error('Ошибка бота:', err);
});

// File IDs фотографий
const PHOTOS = {
  photo1: 'AgACAgIAAxkBAAMSaaXRna3rOvOOHsT68ihcS9ztUxkAAgoWaxum1zFJr0Yn46-pQD0BAAMCAAN5AAM6BA',
  photo2: 'AgACAgIAAxkBAAMUaaXRrh6eTDQn2NnkEPd_crC40KgAAgsWaxum1zFJ_fRhH0Z-w6YBAAMCAAN5AAM6BA',
  photo3: 'AgACAgIAAxkBAAMWaaXRuus7JPNllv6nl-OcedWM8CcAAgwWaxum1zFJbrjaDwebOkIBAAMCAAN5AAM6BA',
  photo4: 'AgACAgIAAxkBAAMYaaXR0z43iORBDW0uIkVh4e5voRoAAg0Waxum1zFJa1LSTZUSnUkBAAMCAAN5AAM6BA',
  photo5: 'AgACAgIAAxkBAAMaaaXR5sYYs8a8gbApiXjy8awPhWUAAg4Waxum1zFJepcaG5_7fuYBAAMCAAN5AAM6BA'
};

// Хранилище данных (в памяти)
const data = {
  channels: [],
  stats: {
    totalStarts: 0,
    totalAccessClicks: 0,
    totalSubscribeClicks: 0,
    daily: {}
  },
  users: {}
};

const adminState = {};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function initDailyStats() {
  const today = getToday();
  if (!data.stats.daily[today]) {
    data.stats.daily[today] = {
      starts: 0,
      accessClicks: 0,
      subscribeClicks: 0
    };
  }
}

function updateStats(type) {
  initDailyStats();
  const today = getToday();
  
  if (type === 'start') {
    data.stats.totalStarts++;
    data.stats.daily[today].starts++;
  } else if (type === 'access') {
    data.stats.totalAccessClicks++;
    data.stats.daily[today].accessClicks++;
  } else if (type === 'subscribe') {
    data.stats.totalSubscribeClicks++;
    data.stats.daily[today].subscribeClicks++;
  }
}

async function sendStep1(ctx) {
  updateStats('start');
  data.users[ctx.from.id] = { step: 1 };
  
  const keyboard = new InlineKeyboard().text('➡️ Далее', 'step2');
  
  await ctx.replyWithPhoto(PHOTOS.photo1, {
    caption: '🎮 *Надоели блокировки Roblox?*\n\n✅ У нас есть решение!\n🚀 *Без ВПН* и прочих заморочек',
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
}

async function sendStep2(ctx) {
  data.users[ctx.from.id] = { step: 2 };
  
  const keyboard = new InlineKeyboard().text('➡️ Далее', 'step3');
  
  await ctx.replyWithPhoto(PHOTOS.photo2, {
    reply_markup: keyboard
  });
}

async function sendStep3(ctx) {
  data.users[ctx.from.id] = { step: 3 };
  
  const keyboard = new InlineKeyboard();
  
  const channelNames = ['Канал 1', 'Канал 2', 'Канал 3', 'Канал 4'];
  for (let i = 0; i < 4 && i < data.channels.length; i++) {
    keyboard.url(`📢 ${channelNames[i]}`, data.channels[i]).row();
  }
  keyboard.text('➡️ Далее', 'step4');
  
  await ctx.replyWithPhoto(PHOTOS.photo3, {
    caption: '📢 *Подпишитесь на каналы*\n\n💡 Там будут:\n• Обновленные способы\n• Полезная информация для игры в Роблокс\n• Актуальные новости',
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
}

async function sendStep4(ctx) {
  data.users[ctx.from.id] = { step: 4 };
  
  const keyboard = new InlineKeyboard();
  
  const channelNames = ['Канал 1', 'Канал 2', 'Канал 3', 'Канал 4'];
  for (let i = 4; i < 8 && i < data.channels.length; i++) {
    keyboard.url(`📢 ${channelNames[i - 4]}`, data.channels[i]).row();
  }
  keyboard.text('✅ Получить доступ', 'access');
  
  await ctx.replyWithPhoto(PHOTOS.photo4, {
    reply_markup: keyboard
  });
}

async function sendStep5(ctx) {
  updateStats('access');
  data.users[ctx.from.id] = { step: 5 };
  
  const keyboard = new InlineKeyboard()
    .text('📢 Подписаться на каналы', 'step3').row()
    .text('🏠 Главное меню', 'step1');
  
  await ctx.replyWithPhoto(PHOTOS.photo5, {
    caption: '⏳ *Ваша заявка будет проверена в течении 24 часов*\n\n⚠️ *ПРИМЕЧАНИЕ:* если вы не подписались на каналы, заявка будет *автоматически отклонена*',
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
}

bot.command('start', sendStep1);

bot.callbackQuery('step1', async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  try {
    await ctx.answerCallbackQuery();
  } catch (e) {}
  await sendStep1(ctx);
});

bot.callbackQuery('step2', async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  try {
    await ctx.answerCallbackQuery();
  } catch (e) {}
  await sendStep2(ctx);
});

bot.callbackQuery('step3', async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  try {
    await ctx.answerCallbackQuery();
  } catch (e) {}
  if (data.users[ctx.from.id]?.step === 5) {
    updateStats('subscribe');
  }
  await sendStep3(ctx);
});

bot.callbackQuery('step4', async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  try {
    await ctx.answerCallbackQuery();
  } catch (e) {}
  await sendStep4(ctx);
});

bot.callbackQuery('access', async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  try {
    await ctx.answerCallbackQuery();
  } catch (e) {}
  await sendStep5(ctx);
});

bot.command('admin67_67', async (ctx) => {
  adminState[ctx.from.id] = 'waiting_links';
  await ctx.reply('🔧 *Админ-панель*\n\nПришлите 8 ссылок на каналы (каждая с новой строки)', {
    parse_mode: 'Markdown'
  });
});

bot.on('message:text', async (ctx) => {
  if (adminState[ctx.from.id] === 'waiting_links') {
    const links = ctx.message.text.split('\n').filter(link => link.trim());
    
    if (links.length === 8) {
      data.channels = links;
      delete adminState[ctx.from.id];
      await ctx.reply('✅ Ссылки успешно обновлены!');
      
      // Отправка уведомления в чат аналитики
      const ANALYTICS_CHAT_ID = process.env.ANALYTICS_CHAT_ID || '5289333953';
      try {
        await bot.api.sendMessage(ANALYTICS_CHAT_ID, 
          `🔄 *Обновление каналов*\n\nАдмин обновил ссылки на каналы:\n\n${links.map((link, i) => `${i + 1}. ${link}`).join('\n')}`,
          { parse_mode: 'Markdown' }
        );
      } catch (e) {
        console.error('Ошибка отправки уведомления:', e.message);
      }
    } else {
      await ctx.reply(`❌ Получено ${links.length} ссылок. Нужно ровно 8 ссылок.`);
    }
  }
});

export { bot };
