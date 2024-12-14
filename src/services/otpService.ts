import { setOtp, getOtp } from '../redisCache';
import { v4 as uuidv4 } from 'uuid';

const OTP_LENGTH = Number(process.env.OTP_LENGTH) || 6;

export const generateOtp = (): string => {
  return uuidv4().slice(0, OTP_LENGTH); // Generating a 6-character OTP
};

export const storeOtp = async (
  email: string,
  otp: string,
  ttl: number,
): Promise<void> => {
  await setOtp(email, otp, ttl); // Storing OTP in redis
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  const storedOtp = await getOtp(email);
  return storedOtp === otp;
};
