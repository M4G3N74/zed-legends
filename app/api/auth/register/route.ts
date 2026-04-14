import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const TELEGRAM_API_URL = (token: string) =>
  `https://api.telegram.org/bot${token}`;
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

interface UserDataStore {
  favorites: any[];
  playlists: any[];
  history: any[];
}

interface UserFile {
  users: StoredUser[];
  userData: Record<string, UserDataStore>;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getTelegramConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  };
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function getUserFile(): Promise<UserFile> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { users: [], userData: {} };
  }
}

async function saveUserFile(file: UserFile): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(file, null, 2));
}

async function saveToTelegram(
  token: string,
  chatId: string,
  file: UserFile
): Promise<void> {
  const jsonStr = JSON.stringify(file);
  const messageText = `__USER_DATA__${jsonStr}`;

  const response = await fetch(`${TELEGRAM_API_URL(token)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram error: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    let userFile = await getUserFile();

    if (
      userFile.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    ) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const userId = crypto.randomUUID();

    const newUser: StoredUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    userFile.users.push(newUser);
    userFile.userData[userId] = {
      favorites: [],
      playlists: [],
      history: [],
    };

    await saveUserFile(userFile);

    const { token, chatId } = getTelegramConfig();
    if (token && chatId) {
      try {
        await saveToTelegram(token, chatId, userFile);
        console.log('Data synced to Telegram');
      } catch (e) {
        console.error('Failed to sync to Telegram:', e);
      }
    }

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
