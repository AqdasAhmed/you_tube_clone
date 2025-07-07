import express from 'express';
import { razorpayPayment, verifyPremium, razorpayWebhook, checkAndRevokePremium } from '../Controllers/payment.js';
import bodyParser from 'body-parser';

const router = express.Router();

router.post("/pay", express.json(), razorpayPayment);
router.post("/verify-premium", verifyPremium);
router.post("/webhook", bodyParser.raw({ type: 'application/json' }), razorpayWebhook);

router.get('/user/:id', async (req, res) => {
    try {
        const user = await checkAndRevokePremium(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;