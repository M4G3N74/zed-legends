import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TELEGRAM_API_URL = (token: string) =>
  `https://api.telegram.org/bot${token}`;
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface UserFile {
  users: any[];
  userData: Record<string, any>;
}

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: 'Telegram not configured' },
      { status: 500 }
    );
  }

  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const userFile: UserFile = JSON.parse(data);

    const messageText = `__USER_DATA__${JSON.stringify(userFile)}`;

    const response = await fetch(`${TELEGRAM_API_URL(token)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Telegram error: ${error}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      messageId: result.result.message_id,
      users: userFile.users.length,
      userDataKeys: Object.keys(userFile.userData).length,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
