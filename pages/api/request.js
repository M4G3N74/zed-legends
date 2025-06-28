export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { request } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: 'Bot token or chat ID not set' });
    }

    const message = `New Zed Legends Request:\n${request}`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    try {
      await fetch(url);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to send to Telegram' });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
} 