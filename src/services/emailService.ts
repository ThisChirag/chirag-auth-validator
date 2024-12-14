const postmark = require('postmark');
import dotenv from 'dotenv';

dotenv.config();

const YOUR_DOMAIN = process.env.YOUR_DOMAIN;

// Initializing Postmark client
const postmarkClient = new postmark.ServerClient(
  process.env.POSTMARK_SERVER_TOKEN || '',
);

// Function to send a verification email
export const sendVerificationEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  try {
    const response = await postmarkClient.sendEmail({
      From: YOUR_DOMAIN, // Verified domain email
      To: email, // Recipient email
      Subject: 'Verify Your Email',
      TextBody: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      HtmlBody: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    });
    console.log('Verification email sent successfully:', response);
  } catch (error: any) {
    console.error('Failed to send verification email:', error.message || error);
    throw new Error('Failed to send verification email');
  }
};
