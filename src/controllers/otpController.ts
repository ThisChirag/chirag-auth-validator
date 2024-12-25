import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils /prisma';
import { validateFields } from '../utils /validateFields';
import { validateEmailDomain } from '../utils /validateDomain';
import { validateEmail } from '../middlewares/validateEmail';
import { validatePassword } from '../utils /validatePassword';
import {
  generateOtp,
  storeOtp,
  verifyOtp as verifyOtpService,
} from '../services/otpService';
import { sendVerificationEmail } from '../services/emailService';
import { hashingPassword, verifyingPassword } from '../utils /hashPassword';
import { deleteCurrentToken } from '../redisCache';
import { checkUsernameExistence } from '../services/checkUsername';

const otp_ttl = parseInt(process.env.OTP_TTL ?? '300', 10);

export const requestOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!validateFields({ email }, res)) return;
    if (!validateEmail(email)) {
      res.status(400).json({ msg: 'Invalid email format' });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ msg: 'User already exists. Please login.' });
      return;
    }
    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      res.status(400).json({ msg: 'Invalid email domain' });
      return;
    }
    const otp = generateOtp();
    await storeOtp(email, otp, otp_ttl);
    const otpSent = await sendVerificationEmail(email, otp);
    if (!otpSent) {
      res.status(500).json({ msg: 'Failed to send verification email' });
      return;
    }
    res.status(200).json({ msg: 'Verification OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password, otp } = req.body;
    if (!validateFields({ email, otp, password, name }, res)) return;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res
        .status(409)
        .json({
          msg: 'User with this email already exists. Please recheck your email or login.',
        });
      return;
    }

    const usernameExists = await checkUsernameExistence(username, res);
    if (usernameExists) {
      res
        .status(400)
        .json({ msg: 'Username already exists, choose a different one' });
      return;
    }
    if (!validateEmail(email)) {
      res.status(400).json({ msg: 'Please enter a valid email address' });
      return;
    }
    if (password.length < 8) {
      res
        .status(401)
        .json({ msg: 'Password must be at least 8 characters long' });
      return;
    }
    if (!validatePassword(password)) {
      res.status(401).json({
        msg: 'Password must contain lowercase, uppercase, digit, and special character',
      });
      return;
    }
    const isValidOtp = await verifyOtpService(email, otp);
    if (!isValidOtp) {
      res
        .status(400)
        .json({
          msg: 'Invalid or expired OTP, or please re-check your email.',
        });
      return;
    }
    const hashedPassword = await hashingPassword(password);
    await prisma.user.create({
      data: { username, email, password: hashedPassword, name },
    });
    res
      .status(201)
      .json({ msg: 'Email verified. Account created successfully.' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ msg: 'Database error' });
      return;
    }
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, oldpassword } = req.body;
    if (!validateFields({ email, oldpassword }, res)) return;
    if (!validateEmail(email)) {
      res.status(400).json({ msg: 'Invalid email address' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    const verifyPass = await verifyingPassword(oldpassword, user.password);
    if (!verifyPass) {
      res.status(400).json({ msg: 'Incorrect old password' });
      return;
    }
    const otp = generateOtp();
    await storeOtp(email, otp, otp_ttl);
    await sendVerificationEmail(email, otp);
    res.status(200).json({ msg: 'Verification OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const verifyOtpForChangePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp, newpassword } = req.body;
    if (!validateFields({ email, otp, newpassword }, res)) return;
    if (!validateEmail(email)) {
      res.status(400).json({ msg: 'Invalid email format' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    const isSamePassword = await verifyingPassword(newpassword, user.password);
    if (isSamePassword) {
      res
        .status(400)
        .json({ msg: 'New password cannot be the same as the old one' });
      return;
    }
    if (newpassword.length < 8) {
      res
        .status(401)
        .json({ msg: 'New password must be at least 8 characters long' });
      return;
    }
    if (!validatePassword(newpassword)) {
      res.status(401).json({
        msg: 'Password must contain lowercase, uppercase, digit, and special character',
      });
      return;
    }
    const isValidOtp = await verifyOtpService(email, otp);
    if (!isValidOtp) {
      res
        .status(400)
        .json({
          msg: 'Invalid or expired OTP, or please re-check your email.',
        });
      return;
    }
    const hashedPassword = await hashingPassword(newpassword);
    const isTokenDeleted = await deleteCurrentToken(email);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).json({ msg: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ msg: 'Database error occurred' });
      return;
    }
    res.status(500).json({ msg: 'Unexpected error' });
  }
};

export const forgotpassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!validateFields({ email }, res)) return;
    if (!validateEmail(email)) {
      res.status(400).json({ msg: 'Invalid email address' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    const otp = generateOtp();
    await storeOtp(email, otp, otp_ttl);
    const otpSent = await sendVerificationEmail(email, otp);
    if (!otpSent) {
      res.status(500).json({ msg: 'Failed to send verification email' });
      return;
    }
    res.status(200).json({ msg: 'Verification OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const verifyOtpForgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, newpassword, otp } = req.body;
    if (!validateFields({ email, newpassword, otp }, res)) return;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    if (newpassword.length < 8) {
      res
        .status(401)
        .json({ msg: 'New password must be at least 8 characters long' });
      return;
    }
    if (!validatePassword(newpassword)) {
      res.status(401).json({
        msg: 'Password must contain lowercase, uppercase, digit, and special character',
      });
      return;
    }
    const isValidOtp = await verifyOtpService(email, otp);
    if (!isValidOtp) {
      res
        .status(400)
        .json({
          msg: 'Invalid or expired OTP, or please re-check your email.',
        });
      return;
    }
    const hashedPassword = await hashingPassword(newpassword);
    const isTokenDeleted = await deleteCurrentToken(email);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).json({ msg: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ msg: 'Database error occurred' });
      return;
    }
    res.status(500).json({ msg: 'Unexpected error' });
  }
};
