import express from 'express';
import { sendotp, verifyOtp } from '../Controllers/otp.js';

const router = express.Router();

router.post('/send', sendotp);
router.post('/verify', verifyOtp);

export default router;