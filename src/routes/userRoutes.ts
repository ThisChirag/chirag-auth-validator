import { Router } from 'express';
import { home, login } from '../controllers/applicationLogic';
import { authenticateToken } from '../middlewares/authenticateToken';
import { rateLimiter } from '../middlewares/rateLimiter';
import { changePassword, requestOtp, verifyOtp, verifyOtpForChangePassword } from '../controllers/otpController'; // Import OTP controllers

const userRoute: Router = Router();

// Protected routes
userRoute.get('/home', authenticateToken, home);

// Authentication routes with rateLimiter middlware where 5 = limit with windowseconds 60 = size 
userRoute.post('/login', rateLimiter('login', 5, 60), login);

// OTP-based signup routes
userRoute.post(
  '/signup/request-verification',
  rateLimiter('signup', 2, 60),
  requestOtp,
); // Request OTP
userRoute.post(
  '/signup/verify-otp',
  rateLimiter('verify-otp', 5, 60),
  verifyOtp,
); // Verify OTP and create account

userRoute.post('/changepassword', changePassword);
userRoute.post('/verify-cp', verifyOtpForChangePassword);

export default userRoute;
