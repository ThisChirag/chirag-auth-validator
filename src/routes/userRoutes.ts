import { Router } from 'express';
import { home, login } from '../controllers/applicationLogic';
import { authenticateToken } from '../middlewares/authenticateToken';
import { rateLimiter } from '../middlewares/rateLimiter';
import {
  changePassword,
  forgotpassword,
  requestOtp,
  verifyOtp,
  verifyOtpForChangePassword,
  verifyOtpForgotPassword,
} from '../controllers/otpController';

const userRoute: Router = Router();

// Home Route (Protected)
userRoute.get('/v1/home', authenticateToken, home);

// Authentication Routes
userRoute.post('/v1/auth/login', rateLimiter(6, 30), login);

// OTP-Based Sign-Up Routes
userRoute.post('/v1/auth/signup/request-otp', rateLimiter(3, 30), requestOtp);
userRoute.post('/v1/auth/signup/verify-otp', rateLimiter(6, 30), verifyOtp);

// OTP-Based Change Password Routes
userRoute.post(
  '/v1/users/password/request-otp',
  rateLimiter(3, 30),
  changePassword,
);
userRoute.post(
  '/v1/users/password/verify-otp',
  rateLimiter(6, 30),
  verifyOtpForChangePassword,
);

// OTP-Based Forgot Password Routes
userRoute.post(
  '/v1/users/password/reset/request-otp',
  rateLimiter(3, 30),
  forgotpassword,
);
userRoute.post(
  '/v1/users/password/reset/verify-otp',
  rateLimiter(6, 30),
  verifyOtpForgotPassword,
);

export default userRoute;
