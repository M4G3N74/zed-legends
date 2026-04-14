import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

interface UserFile {
  users: User[];
  userData: Record<string, any>;
}

async function getUserFile(): Promise<UserFile> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { users: [], userData: {} };
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userFile = await getUserFile();
    const user = userFile.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
