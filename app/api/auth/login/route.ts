import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' })
});

// Mock user for demo purposes
const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  hashedPassword: bcrypt.hashSync('password123', 10),
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // In a real application, you would fetch the user from your database
    // For this example, we'll check against our mock user
    if (email !== mockUser.email) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, mockUser.hashedPassword);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    // In a real application, use a secure JWT_SECRET from your environment variables
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success with token
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: (error as Error).message },
      { status: 500 }
    );
  }
} 