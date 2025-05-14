import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/utils/email';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Generate token even if user doesn't exist (for security)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    
    // Only save token if user exists
    if (user) {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(resetTokenExpiry);
      await user.save();
      
      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      
      // Send email with reset link
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}. This link is valid for 1 hour.`,
        html: `
          <div>
            <h1>Password Reset</h1>
            <p>You requested a password reset for your WebcamRips account.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}" target="_blank">Reset Password</a>
            <p>This link is valid for 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
    }
    
    // Always return success for security reasons
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
    
  } catch (error: any) {
    console.error('Password reset request error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 