import { Telegraf, Markup } from 'telegraf';
import { getChannels, setChannels, trackUserAction, getStatsDay, getStatsWeek, getStatsChatId, setStatsChatId } from '../lib/storage.js';

const bot = new Telegraf(process.env.BOT_TOKEN);
const ANALYTICS_CHAT_ID = process.env.ANALYTICS_CHAT_ID;

const PHOTOS = {
  welcome: 'AgACAgIAAxkBAAM_aamRHV2Gp5xs_CDUhM14MFx9kW4AAtARaxs1GlBJKDoeFFEJF5kBAAMCAAN5AAM6BA',
  a1: 'AgACAgIAAxkBAAMPaamDRbNMiLe39wQ73c_kQWx_-2EAAjERaxs1GlBJdOXqveMoSuoBAAMCAAN5AAM6BA', // A1 ✅
  a2: 'AgACAgIAAxkBAAMQaamDRQrZZShpgLhW0J-_0TXo8uMAAjIRaxs1GlBJBy80knLNBZYBAAMCAAN5AAM6BA', // A2 ✅
  a3: 'AgACAgIAAxkBAAMRaamDRfkGYG03vsLhe-0sp_vu8pkAAjMRaxs1GlBJT5ksrZFkGTIBAAMCAAN5AAM6BA', // A3 каналы ✅
  a4: 'AgACAgIAAxkBAAMSaamDRZ6Gt3mDJUxkmx5oo7x6H9EAAjQRaxs1GlBJyuO9kgUVGLYBAAMCAAN5AAM6BA', // A4 финал ✅
  b1: 'AgACAgIAAxkBAANGaamWQ0tAGpkwOxSkwxpj4_zWsTQAAvERaxs1GlBJRzc5V6S9ShUBAAMCAAN5AAM6BA',
  b2: 'AgACAgIAAxkBAANKaamXLuVu6xk6TG5mOdoPMEtkiqYAAvoRaxs1GlBJeCitKD1IF5EBAAMCAAN5AAM6BA',
  b3: 'AgACAgIAAxkBAAMRaamDRfkGYG03vsLhe-0sp_vu8pkAAjMRaxs1GlBJT5ksrZFkGTIBAAMCAAN5AAM6BA', // B3 каналы (то же что A3)
  b4: 'AgACAgIAAxkBAAMSaamDRZ6Gt3mDJUxkmx5oo7x6H9EAAjQRaxs1GlBJyuO9kgUVGLYBAAMCAAN5AAM6BA'  // B4 финал (то же что A4)
};

const adminState = new Map();

async function sendStart(ctx) {
  try {
    trackUserAction(ctx.from.id, 'start', null); // Не ждем
    
    await ctx.replyWithPhoto(PHOTOS.welcome, {
      caption: '👋 Привет! Выбери, что тебя интересует:',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Получить обход Roblox', 'path_a')],
        [Markup.button.callback('🎁 Участвовать в розыгрыше Robux', 'path_b')]
      ])
    });
  } catch (error) {
    await ctx.reply('👋 Привет! Выбери, что тебя интересует:', 
      Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Получить обход Roblox', 'path_a')],
        [Markup.button.callback('🎁 Участвовать в розыгрыше Robux', 'path_b')]
      ])
    );
  }
}

async function sendA1(ctx) {
  trackUserAction(ctx.from.id, 'path_a_selected', 'a'); // Не ждем
  
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.a1, caption: 'Надоели блокировки Roblox? У нас есть решение! Без ВПН и прочих заморочек' },
    Markup.inlineKeyboard([[Markup.button.callback('Далее', 'a2')]])
  );
}

async function sendA2(ctx) {
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.a2 },
    Markup.inlineKeyboard([[Markup.button.callback('Далее', 'a3')]])
  );
}

async function sendA3(ctx) {
  const channels = await getChannels();
  
  if (channels.length === 0) {
    await ctx.editMessageCaption(
      'Подпишитесь на каналы (там будут обновленные способы и полезная информация для игры в Роблокс)\n\n⚠️ Каналы еще не настроены администратором',
      Markup.inlineKeyboard([[Markup.button.callback('Получить доступ', 'a_access')]])
    );
    return;
  }
  
  const buttons = [];
  
  // 4 ряда по 2 кнопки
  for (let i = 0; i < 8; i += 2) {
    const row = [];
    if (channels[i]) row.push(Markup.button.url(`📢 Канал ${i + 1}`, channels[i]));
    if (channels[i + 1]) row.push(Markup.button.url(`📢 Канал ${i + 2}`, channels[i + 1]));
    if (row.length > 0) buttons.push(row);
  }
  
  buttons.push([Markup.button.callback('Получить доступ', 'a_access')]);
  
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.a3, caption: 'Подпишитесь на каналы (там будут обновленные способы и полезная информация для игры в Роблокс)' },
    Markup.inlineKeyboard(buttons)
  );
}

async function sendA4(ctx) {
  trackUserAction(ctx.from.id, 'access_a', 'a'); // Не ждем
  
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.a4, caption: 'Ваша заявка будет проверена в течении 24 часов. ПРИМЕЧАНИЕ: если вы не подписались на каналы заявка будет автоматически отклонена' },
    Markup.inlineKeyboard([
      [Markup.button.callback('Подписаться на каналы', 'a3')],
      [Markup.button.callback('Главное меню', 'start')]
    ])
  );
}

async function sendB1(ctx) {
  trackUserAction(ctx.from.id, 'path_b_selected', 'b'); // Не ждем
  
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.b1, caption: 'Хочешь получить бесплатные Robux? Участвуй в нашем мега-розыгрыше!' },
    Markup.inlineKeyboard([[Markup.button.callback('Далее', 'b2')]])
  );
}

async function sendB2(ctx) {
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.b2 },
    Markup.inlineKeyboard([[Markup.button.callback('Далее', 'b3')]])
  );
}

async function sendB3(ctx) {
  const channels = await getChannels();
  
  if (channels.length === 0) {
    await ctx.editMessageCaption(
      'Подпишитесь на каналы (там регулярно проходят розыгрыши Robux и раздачи)\n\n⚠️ Каналы еще не настроены администратором',
      Markup.inlineKeyboard([[Markup.button.callback('Участвовать', 'b_access')]])
    );
    return;
  }
  
  const buttons = [];
  
  // 4 ряда по 2 кнопки
  for (let i = 0; i < 8; i += 2) {
    const row = [];
    if (channels[i]) row.push(Markup.button.url(`📢 Канал ${i + 1}`, channels[i]));
    if (channels[i + 1]) row.push(Markup.button.url(`📢 Канал ${i + 2}`, channels[i + 1]));
    if (row.length > 0) buttons.push(row);
  }
  
  buttons.push([Markup.button.callback('Участвовать', 'b_access')]);
  
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.b3, caption: 'Подпишитесь на каналы (там регулярно проходят розыгрыши Robux и раздачи)' },
    Markup.inlineKeyboard(buttons)
  );
}

async function sendB4(ctx) {
  trackUserAction(ctx.from.id, 'access_b', 'b'); // Не ждем
  
  await ctx.editMessageMedia(
    { type: 'photo', media: PHOTOS.b4, caption: 'Ваша заявка на участие будет проверена в течении 24 часов. ПРИМЕЧАНИЕ: если вы не подписались на каналы заявка будет автоматически отклонена' },
    Markup.inlineKeyboard([
      [Markup.button.callback('Подписаться на каналы', 'b3')],
      [Markup.button.callback('Главное меню', 'start')]
    ])
  );
}

bot.command('start', sendStart);

bot.action('start', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  await sendStart(ctx);
});

bot.action('path_a', async (ctx) => {
  await ctx.answerCbQuery();
  await sendA1(ctx);
});

bot.action('a2', async (ctx) => {
  await ctx.answerCbQuery();
  await sendA2(ctx);
});

bot.action('a3', async (ctx) => {
  await ctx.answerCbQuery();
  await sendA3(ctx);
});

bot.action('a_access', async (ctx) => {
  await ctx.answerCbQuery();
  await sendA4(ctx);
});

bot.action('path_b', async (ctx) => {
  await ctx.answerCbQuery();
  await sendB1(ctx);
});

bot.action('b2', async (ctx) => {
  await ctx.answerCbQuery();
  await sendB2(ctx);
});

bot.action('b3', async (ctx) => {
  await ctx.answerCbQuery();
  await sendB3(ctx);
});

bot.action('b_access', async (ctx) => {
  await ctx.answerCbQuery();
  await sendB4(ctx);
});

bot.command('admin6788_6798', async (ctx) => {
  adminState.set(ctx.from.id, 'waiting_links');
  await ctx.reply('🔧 Админ-панель\n\nПришлите 8 ссылок на каналы (каждая с новой строки или через пробел)');
});

bot.command('stat_day', async (ctx) => {
  const stats = await getStatsDay();
  const chatId = await getStatsChatId() || ANALYTICS_CHAT_ID;
  
  const message = `📊 Статистика за сегодня (${stats.date})\n\n` +
    `👥 Уникальных пользователей: ${stats.uniqueUsers}\n` +
    `▫️ /start: ${stats.starts}\n` +
    `▫️ Путь A (обход): ${stats.pathA}\n` +
    `▫️ Путь B (розыгрыш): ${stats.pathB}\n` +
    `▫️ Доступ A: ${stats.accessA}\n` +
    `▫️ Участие B: ${stats.accessB}`;
  
  if (chatId) {
    await bot.telegram.sendMessage(chatId, message);
  }
  await ctx.reply('✅ Статистика за день отправлена');
});

bot.command('stat_week', async (ctx) => {
  const stats = await getStatsWeek();
  const chatId = await getStatsChatId() || ANALYTICS_CHAT_ID;
  
  let message = `📊 Статистика за неделю\n\n👥 Уникальных пользователей: ${stats.uniqueUsersWeek}\n\n`;
  
  Object.entries(stats.days).forEach(([date, data]) => {
    message += `📅 ${date}\n`;
    message += `  /start: ${data.starts} | A: ${data.pathA} | B: ${data.pathB} | Доступ A: ${data.accessA} | Участие B: ${data.accessB}\n\n`;
  });
  
  if (chatId) {
    await bot.telegram.sendMessage(chatId, message);
  }
  await ctx.reply('✅ Статистика за неделю отправлена');
});

bot.command('stat_link', async (ctx) => {
  adminState.set(ctx.from.id, 'waiting_stat_chat');
  await ctx.reply('📊 Настройка чата для статистики\n\nОтправьте ID чата (например: -1001234567890)\n\nЧтобы узнать ID чата, добавьте бота в канал/группу и отправьте туда /chatid');
});

bot.command('chatid', async (ctx) => {
  await ctx.reply(`📋 ID этого чата: ${ctx.chat.id}`);
});

bot.command('testdb', async (ctx) => {
  try {
    const channels = await getChannels();
    await ctx.reply(`✅ БД подключена!\n\nКаналов в БД: ${channels.length}\n\n${channels.length > 0 ? channels.join('\n') : 'Каналы не настроены'}`);
  } catch (error) {
    await ctx.reply(`❌ Ошибка подключения к БД:\n\n${error.message}`);
  }
});

bot.command('upload_photo', async (ctx) => {
  adminState.set(ctx.from.id, 'waiting_photo');
  await ctx.reply('📸 Отправьте фото, чтобы получить file_id');
});

bot.command('stats', async (ctx) => {
  const stats = await getStats();
  
  const message = `📊 Статистика\n\n` +
    `👥 Уникальных пользователей: ${stats.totalUsers}\n\n` +
    `📈 Всего (Сегодня):\n` +
    `• /start: ${stats.total.starts} (${stats.today.starts})\n` +
    `• Путь A выбран: ${stats.total.pathA} (${stats.today.pathA})\n` +
    `• Путь B выбран: ${stats.total.pathB} (${stats.today.pathB})\n` +
    `• Доступ A: ${stats.total.accessA} (${stats.today.accessA})\n` +
    `• Участие B: ${stats.total.accessB} (${stats.today.accessB})`;
  
  if (ANALYTICS_CHAT_ID) {
    await bot.telegram.sendMessage(ANALYTICS_CHAT_ID, message);
  }
  await ctx.reply('✅ Статистика отправлена');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = adminState.get(userId);
  
  if (state === 'waiting_links') {
    const text = ctx.message.text;
    const links = text.match(/https?:\/\/t\.me\/[^\s]+/g) || [];
    
    if (links.length === 8) {
      await setChannels(links);
      adminState.delete(userId);
      await ctx.reply('✅ Ссылки успешно обновлены!');
      
      if (ANALYTICS_CHAT_ID) {
        await bot.telegram.sendMessage(
          ANALYTICS_CHAT_ID,
          `🔄 Обновление каналов\n\nАдмин обновил ссылки:\n\n${links.map((l, i) => `${i + 1}. ${l}`).join('\n')}`
        );
      }
    } else {
      await ctx.reply(`❌ Найдено ${links.length} ссылок. Нужно ровно 8 ссылок формата https://t.me/...`);
    }
  } else if (state === 'waiting_stat_chat') {
    const chatId = ctx.message.text.trim();
    if (/^-?\d+$/.test(chatId)) {
      await setStatsChatId(chatId);
      adminState.delete(userId);
      await ctx.reply(`✅ ID чата для статистики установлен: ${chatId}`);
    } else {
      await ctx.reply('❌ Неверный формат. Отправьте числовой ID чата (например: -1001234567890)');
    }
  }
});

bot.on('photo', async (ctx) => {
  if (adminState.get(ctx.from.id) === 'waiting_photo') {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    await ctx.reply(`📸 File ID фото:\n\n\`${fileId}\`\n\nСкопируйте и используйте в коде`, { parse_mode: 'Markdown' });
  }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(200).json({ ok: true });
    }
  }
  
  return res.status(200).json({ status: 'Bot is running' });
}
