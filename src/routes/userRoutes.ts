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

// Protected routes
userRoute.get('/home', authenticateToken, home);

// Authentication routes with rateLimiter middlware where 5 = limit with windowseconds 30 = size
userRoute.post('/login', rateLimiter(5, 30), login);

// OTP-based routes to 'Sing-up'
userRoute.post('/signup/request-verification', rateLimiter(3, 30), requestOtp); // Request OTP
userRoute.post('/signup/verify-otp', rateLimiter(3, 30), verifyOtp); // Verify OTP and create account

//OTP-based routes to 'Change Password'
userRoute.post('/changepassword', rateLimiter(3, 30), changePassword);// Request OTP
userRoute.post('/verify-cp', rateLimiter(3, 30), verifyOtpForChangePassword);// Verify OTP and change password

//OTP-based routes to 'Reset the Password'
userRoute.post('/forgotpassword', rateLimiter(3, 30), forgotpassword);// Request OTP
userRoute.post('/verify-fp', rateLimiter(3, 30), verifyOtpForgotPassword);// Verify OTP and reset password

export default userRoute;
