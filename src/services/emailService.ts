import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const YOUR_DOMAIN = process.env.YOUR_DOMAIN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const otp_ttl = parseInt(process.env.OTP_TTL ?? '300') / 60;

if (!RESEND_API_KEY) {
  throw new Error(
    'RESEND_API_KEY is not defined in the environment variables.',
  );
}

const resend = new Resend(RESEND_API_KEY);

export const sendVerificationEmail = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: YOUR_DOMAIN!,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #555;">Verify Your Email</h2>
          <p>Your OTP is: <strong style="color: #2d89ef;">${otp}</strong></p>
          <p>This OTP is valid for <strong>${otp_ttl} minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log('Email sent successfully:', data);
    return true;
  } catch (error: any) {
    console.error('Failed to send verification email:', error.message || error);
    return false;
  }
};
