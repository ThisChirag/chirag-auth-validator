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
} from '../controllers/otpController'; // Import OTP controllers

const userRoute: Router = Router();

// Protected routes
userRoute.get('/home', authenticateToken, home);

// Authentication routes with rateLimiter middlware where 5 = limit with windowseconds 60 = size
userRoute.post('/login', rateLimiter(5, 60), login);

// OTP-based signup routes
userRoute.post('/signup/request-verification', rateLimiter( 1, 60), requestOtp); // Request OTP
userRoute.post('/signup/verify-otp', rateLimiter(3, 60), verifyOtp,); // Verify OTP and create account

userRoute.post('/changepassword',rateLimiter(1, 60), changePassword);
userRoute.post('/verify-cp', rateLimiter(3, 60),verifyOtpForChangePassword);

userRoute.post('/forgotpassword',rateLimiter(1, 60), forgotpassword);
userRoute.post('/verify-fp', rateLimiter(3, 60), verifyOtpForgotPassword);

export default userRoute;
