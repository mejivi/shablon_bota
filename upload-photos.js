import { Bot, InputFile } from 'grammy';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = '8322765545:AAF2O--N6SuBLCW6VgZDAvrRu4DB29tFwBQ';
const CHAT_ID = '5289333953'; // Ваш chat ID

const bot = new Bot(TOKEN);

async function uploadPhotos() {
  console.log('Загружаем фотографии...');
  
  const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'];
  const fileIds = {};
  
  for (const photoName of photos) {
    try {
      const photo = new InputFile(join(__dirname, 'photo', photoName));
      const result = await bot.api.sendPhoto(CHAT_ID, photo);
      fileIds[photoName] = result.photo[result.photo.length - 1].file_id;
      console.log(`✅ ${photoName}: ${fileIds[photoName]}`);
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${photoName}:`, error.message);
    }
  }
  
  console.log('\n📋 Скопируйте эти file_id:');
  console.log(JSON.stringify(fileIds, null, 2));
}

uploadPhotos();
