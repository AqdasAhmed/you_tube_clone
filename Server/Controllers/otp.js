import nodemailer from 'nodemailer';

const otpStore = {};

export const sendotp = async (req, res) => {
    const { email, mobile, method } = req.body;


    if (!method || (!email && !mobile)) {
        console.error("Invalid OTP request:", req.body);
        return res.status(400).json({ error: "Invalid OTP method or contact info" });
    }

    console.log(`Processing OTP request for ${method}: ${email || mobile}`);

    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
        if (method === 'email' && email) {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_ID,
                to: email,
                subject: "Your OTP Code",
                text: `Your OTP is: ${otp}`
            });

            otpStore[email] = otp;
            setTimeout(() => { delete otpStore[email]; }, 5 * 60 * 1000);

            console.log(`OTP sent to email: ${email}`);
            return res.status(200).json({ message: "OTP sent to email" });
        } else if (method === 'mobile' && mobile) {
            console.log(`[Mock SMS] Sending OTP ${otp} to mobile: ${mobile}`);
            otpStore[mobile] = otp;
            setTimeout(() => { delete otpStore[mobile]; }, 5 * 60 * 1000);
            return res.status(200).json({ message: "Mock OTP sent to mobile" });
        } else {
            console.error("Invalid OTP method or contact info:", req.body);
            return res.status(400).json({ error: "Invalid OTP method or contact info" });
        }
    } catch (error) {
        console.error("OTP Send Error:", error);
        return res.status(500).json({ error: "Failed to send OTP" });
    }

};

export const verifyOtp = (req, res) => {
    const { email, mobile, otp } = req.body;
    const key = email || mobile;
    if (!key || !otp) {
        return res.status(400).json({ success: false, error: "Missing email/mobile or OTP" });
    }
    if (otpStore[key] && String(otpStore[key]) === String(otp)) {
        delete otpStore[key];
        return res.status(200).json({ success: true });
    } else {
        return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }
};