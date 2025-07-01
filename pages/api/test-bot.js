export default async function handler(req, res) {
  if (req.method === 'POST') {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: 'Bot token or chat ID not set' });
    }

    const testMessage = `🔔 Bot Test Message\n\nTime: ${new Date().toLocaleString()}\nStatus: Bot is working in private mode!`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        return res.status(200).json({ 
          success: true, 
          message: 'Test message sent successfully!',
          chatId: chatId 
        });
      } else {
        return res.status(400).json({ 
          error: 'Failed to send message', 
          details: result 
        });
      }
    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to send to Telegram', 
        details: error.message 
      });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
} 