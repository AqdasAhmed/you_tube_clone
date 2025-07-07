import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import User from '../Models/Auth.js';

dotenv.config();

console.log('Initializing Razorpay payment controller');
export const razorpayPayment = async (req, res) => {
    console.log('Razorpay payment controller initialized');
    let amount, userId;
    if (Buffer.isBuffer(req.body)) {
        try {
            const parsed = JSON.parse(req.body.toString());
            amount = parsed.amount;
            userId = parsed.userId;
        } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid JSON body" });
        }
    } else {
        amount = req.body.amount;
        userId = req.body.userId;
    }
    try {
        const razorpay = new Razorpay({
            key_id: process.env.Razorpay_KEY,
            key_secret: process.env.Razorpay_KEY_SECRET,
        });
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `rcptid_${Date.now()}`,
            payment_capture: 1,
            notes: { userId }
        });
        console.log('Razorpay order created:', order);
        return res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        return res.status(502).json({
            success: false,
            message: "Razorpay order creation failed",
            error: err.message,
        });
    }
};

console.log('Razorpay payment controller completed');
console.log('Initializing verifyPremium controller');
export const verifyPremium = async (req, res) => {
    console.log('verifyPremium controller initialized');
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    try {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const updatedUser = await User.findByIdAndUpdate(userId, { premium: true, premiumExpiresAt: expires }, { new: true });
        console.log('[verifyPremium] Set premium for user:', userId, 'Expires at:', expires, 'User after update:', updatedUser);
        return res.status(200).json({ success: true, message: "Premium activated", expires });
    } catch (err) {
        console.error("Error verifying premium:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
console.log('verifyPremium controller completed');

console.log('Initializing checkAndRevokePremium function');
export const checkAndRevokePremium = async (userId) => {
    console.log('checkAndRevokePremium function initialized');
    const user = await User.findById(userId);
    if (user && user.premium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
        user.premium = false;
        user.premiumExpiresAt = null;
        await user.save();
        console.log('[checkAndRevokePremium] Premium revoked for user:', userId);
    }
    return user;
};
console.log('checkAndRevokePremium function completed');

console.log('Initializing Razorpay webhook');
export const razorpayWebhook = async (req, res) => {
    console.log('Razorpay webhook initialized');
    const secret = process.env.Razorpay_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    if (generatedSignature !== signature) {
        console.error('Razorpay signature mismatch');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    try {
        const payload = JSON.parse(rawBody.toString());
        console.log('Received Razorpay webhook:', payload);

        const payment = payload.payload?.payment?.entity;
        const userId = payment?.notes?.userId;
        if (userId) {
            const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
            const updatedUser = await User.findByIdAndUpdate(userId, { premium: true, premiumExpiresAt: expires }, { new: true });
            console.log('[razorpayWebhook] Set premium for user:', userId, 'Expires at:', expires, 'User after update:', updatedUser);
        }
        console.log('Razorpay webhook processed successfully');
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error in Razorpay webhook:', err);
        console.log("Computed Signature:", generatedSignature);
        console.log("Received Signature:", signature);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};