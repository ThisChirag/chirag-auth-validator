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
import { verifyingPassword } from '../utils /hashPassword';
import { Prisma } from '@prisma/client';
import { validateEmail } from '../middlewares/validateEmail';
import { validateFields } from '../utils /validateFields';
import { deleteCurrentToken } from '../redisCache';

export const requestOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!validateFields({ email }, res)) return;

  const isEmailValid = validateEmail(email);
  if (!isEmailValid) {
    res.status(400).json({
      msg: 'Wrong Email Format',
    });
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
  const otpSent = await sendVerificationEmail(email, otp);

  if (!otpSent) {
    res.status(500).json({
      msg: 'Failed to send verification email',
    });
    return;
  }

  res.status(200).json({ message: 'Verification OTP sent to your email' });
};

//Verify OTP and create user account
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, password, name } = req.body;

  if (!validateFields({ email, otp, password, name }, res)) return;

  const isEmailValid = validateEmail(email);
  if (!isEmailValid) {
    res.status(400).json({
      msg: 'Please enter the correct email address',
    });
    return;
  }

  if (password.length < 8) {
    res.status(401).json({ msg: 'password should be atleast of 8 characters' });
    return;
  }

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
      .json({ message: 'Email verified. Account created successfull.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//ChangeP Password Route
export const changePassword = async (req: Request, res: Response) => {
  const { email, oldpassword } = req.body;

  if (!validateFields({ email, oldpassword }, res)) return;

  const isEmailValid = validateEmail(email);
  if (!isEmailValid) {
    res.status(400).json({
      msg: 'Wrong email enter the correct email address',
    });
    return;
  }

  const user_present = await prisma.user.findUnique({
    where: { email },
  });
  if (!user_present) {
    res.status(404).json({
      msg: 'user not found',
    });
    return;
  }
  const hashedPassword = user_present?.password;
  const verifyPass = await verifyingPassword(oldpassword, hashedPassword);

  if (!verifyPass) {
    res.status(400).json({
      msg: 'Wrong old password, please type the correct one',
    });
    return;
  }

  if (hashedPassword && verifyPass) {
    const otp = generateOtp();
    await storeOtp(email, otp, 300); // 5 minutes TTL
    await sendVerificationEmail(email, otp);

    res.status(200).json({ message: 'Verification OTP sent to your email' });
    return;
  }
};

export const verifyOtpForChangePassword = async (
  req: Request,
  res: Response,
) => {
  const { email, otp, newpassword } = req.body;

  if (!validateFields({ email, otp, newpassword }, res)) return;

  const isEmailValid = validateEmail(email);
  if (!isEmailValid) {
    res.status(400).json({
      msg: 'Wrong format, please enter the mail you want to verify the otp for',
    });
    return;
  }

  const user_present = await prisma.user.findUnique({
    where: { email },
  });

  if (!user_present) {
    res.status(404).json({
      msg: 'user not found, please enter the correct email',
    });
    return;
  }
  const oldpassword = user_present?.password;
  const isBothPasswordSame = await verifyingPassword(newpassword, oldpassword);

  if (isBothPasswordSame) {
    res.status(400).json({
      msg: 'new password cannot be same as the old one, please choose a different password',
    });
    return;
  }

  if (newpassword.length < 8) {
    res
      .status(401)
      .json({ msg: 'new password should be atleast of 8 characters' });
    return;
  }

  if (!validatePassword(newpassword)) {
    res.status(401).json({
      msg: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
    });
    return;
  }

  const isValidOtp = await verifyOtpService(email, otp);

  if (!isValidOtp) {
    res.status(400).json({ msg: 'Invalid or expired OTP' });
    return;
  }

  const hashedPassword = await hashingPassword(newpassword);

  try {
    //changing the password
    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });

    await deleteCurrentToken(email);

    res.status(200).json({
      msg: 'Password Changed Succussfully',
    });
    return;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ msg: 'Database error Occured' });
    } else {
      res.status(500).json({ msg: 'Unexpected Error' });
    }
  }
};

export const forgotpassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!validateFields({ email }, res)) return;

  const isEmailValid = await validateEmail(email);

  if (!isEmailValid) {
    res.status(400).send({
      msg: 'not a valid email address, please enter the correct one',
    });
    return;
  }
  const user_present = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user_present) {
    res.status(400).json({
      msg: 'user not found',
    });
    return;
  }

  const otp = generateOtp();
  await storeOtp(email, otp, 300); // 5 minutes TTL
  const otpSent = await sendVerificationEmail(email, otp);

  if (!otpSent) {
    res.status(500).json({
      msg: 'Failed to send verification email',
    });
    return;
  }

  res.status(200).json({ message: 'Verification OTP sent to your email' });
};

//
export const verifyOtpForgotPassword = async (req: Request, res: Response) => {
  const { email, newpassword, otp } = req.body;

  if (!validateFields({ email, otp, newpassword }, res)) return;

  const user_present = await prisma.user.findUnique({
    where: { email },
  });

  if (!user_present) {
    res.status(400).json({
      msg: 'user not present, please enter the correct mail',
    });
    return;
  }

  if (newpassword.length < 8) {
    res
      .status(401)
      .json({ msg: 'new password should be atleast of 8 characters' });
    return;
  }

  if (!validatePassword(newpassword)) {
    res.status(401).json({
      msg: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
    });
    return;
  }

  const isValidOtp = await verifyOtpService(email, otp);

  if (!isValidOtp) {
    res.status(400).json({ msg: 'Invalid or expired OTP' });
    return;
  }

  const hashedPassword = await hashingPassword(newpassword);

  try {
    //changing the password
    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });

    await deleteCurrentToken(email);

    res.status(200).json({
      msg: 'Password Updated Succussfully',
    });
    return;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ msg: 'Database error Occured' });
    } else {
      res.status(500).json({ msg: 'Unexpected Error' });
    }
  }
};
