export default async function handler(req, res) {
  return res.status(200).json({ 
    method: req.method,
    headers: req.headers,
    body: req.body,
    env: {
      hasToken: !!process.env.BOT_TOKEN,
      nodeVersion: process.version
    }
  });
}
