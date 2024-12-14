import { Request, Response } from 'express';
import { validateEmailDomain } from '../utils /validateDomain';
import {
  generateOtp,
  storeOtp,
  verifyOtp as verifyOtpService,
} from '../services/otpService';
import { sendVerificationEmail } from '../services/emailService';
import { hashingPassword } from '../utils /hashPassword';
import prisma from '../utils /prisma';
import { validatePassword } from '../utils /validatePassword';
import { validateEmailSMTP } from '../utils /validateEmailSMTP';

export const requestOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  // Check if user already exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(409).json({ message: 'User already exists. Please login.' });
    return;
  }

  // Validate email domain
  if (!(await validateEmailDomain(email))) {
    res.status(400).json({ message: 'Invalid email domain' });
    return;
  }

  /*Checking mail's SMTP Server using ZeroBounce, uncomment this only if you want to check for SMTP
  
  if(!(validateEmailSMTP(email))){
    res.status(400).json({message: "Error in SMTP"})
  }
  */

  // Generate OTP and store in Redis
  const otp = generateOtp();
  await storeOtp(email, otp, 300); // 5 minutes TTL
  await sendVerificationEmail(email, otp);

  res.status(200).json({ message: 'Verification OTP sent to your email' });
};

//Verify OTP and create user account
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, password, name } = req.body;

  if (!email || !otp || !password || !name) {
    res
      .status(400)
      .json({ msg: 'Email, OTP, name, and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(401).json({ msg: 'password should be atleast of 8 characters' });
    return;
  }

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!validatePassword(password)) {
    res.status(401).json({
      msg: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
    });
    return;
  }

  // Verify OTP from Redis
  const isValidOtp = await verifyOtpService(email, otp);
  if (!isValidOtp) {
    res.status(400).json({ message: 'Invalid or expired OTP' });
    return;
  }

  // Hash the password
  const hashedPassword = await hashingPassword(password);

  try {
    // Create user in the database
    const user = await prisma.user.create({
      data: { username: name, email, password: hashedPassword },
    });

    res
      .status(201)
      .json({ message: 'Email verified successfully. Account created.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
