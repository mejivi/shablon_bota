import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'roblox_bot';

  if (!uri) {
    throw new Error('MONGODB_URI not configured');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getChannels() {
  const { db } = await connectToDatabase();
  const settings = await db.collection('settings').findOne({ _id: 'channels' });
  return settings?.links || [];
}

export async function setChannels(links) {
  const { db } = await connectToDatabase();
  await db.collection('settings').updateOne(
    { _id: 'channels' },
    { $set: { links, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function trackUserAction(userId, action, path) {
  // Неблокирующая запись - не ждем результата
  connectToDatabase().then(({ db }) => {
    const today = new Date().toISOString().split('T')[0];
    
    db.collection('analytics').insertOne({
      userId,
      action,
      path,
      date: today,
      timestamp: new Date()
    }).catch(err => console.error('Analytics error:', err));

    db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { lastAction: action, lastSeen: new Date() },
        $setOnInsert: { firstSeen: new Date() }
      },
      { upsert: true }
    ).catch(err => console.error('User update error:', err));
  }).catch(err => console.error('DB connection error:', err));
}

export async function getStatsDay() {
  const { db } = await connectToDatabase();
  const today = new Date().toISOString().split('T')[0];

  const uniqueUsers = await db.collection('analytics').distinct('userId', { date: today });
  const starts = await db.collection('analytics').countDocuments({ action: 'start', date: today });
  const pathA = await db.collection('analytics').countDocuments({ action: 'path_a_selected', date: today });
  const pathB = await db.collection('analytics').countDocuments({ action: 'path_b_selected', date: today });
  const accessA = await db.collection('analytics').countDocuments({ action: 'access_a', date: today });
  const accessB = await db.collection('analytics').countDocuments({ action: 'access_b', date: today });

  return {
    date: today,
    uniqueUsers: uniqueUsers.length,
    starts,
    pathA,
    pathB,
    accessA,
    accessB
  };
}

export async function getStatsWeek() {
  const { db } = await connectToDatabase();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const dailyStats = await db.collection('analytics').aggregate([
    { $match: { date: { $gte: weekAgoStr } } },
    {
      $group: {
        _id: { date: '$date', action: '$action' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]).toArray();

  const uniqueUsersWeek = await db.collection('analytics').distinct('userId', { date: { $gte: weekAgoStr } });

  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days[dateStr] = { starts: 0, pathA: 0, pathB: 0, accessA: 0, accessB: 0 };
  }

  dailyStats.forEach(item => {
    const date = item._id.date;
    const action = item._id.action;
    if (days[date]) {
      if (action === 'start') days[date].starts = item.count;
      if (action === 'path_a_selected') days[date].pathA = item.count;
      if (action === 'path_b_selected') days[date].pathB = item.count;
      if (action === 'access_a') days[date].accessA = item.count;
      if (action === 'access_b') days[date].accessB = item.count;
    }
  });

  return {
    uniqueUsersWeek: uniqueUsersWeek.length,
    days
  };
}

export async function getStatsChatId() {
  const { db } = await connectToDatabase();
  const settings = await db.collection('settings').findOne({ _id: 'stats_chat' });
  return settings?.chatId || null;
}

export async function setStatsChatId(chatId) {
  const { db } = await connectToDatabase();
  await db.collection('settings').updateOne(
    { _id: 'stats_chat' },
    { $set: { chatId, updatedAt: new Date() } },
    { upsert: true }
  );
}
