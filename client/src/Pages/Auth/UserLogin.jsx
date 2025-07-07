import React, { useState } from 'react';
import { getUserLocation } from '../../utils/useLocationInfo';
import { getThemeAndOtpMethod } from '../../utils/themeAndOtpUtils';
import axios from 'axios';
import { sendOtp } from '../../utils/firbaseOtp';

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [needsPhone, setNeedsPhone] = useState(false);

    const handleOtpSend = async () => {
        try {
            const location = await getUserLocation();
            const { otpMethod } = getThemeAndOtpMethod(location.state);
            const res = await axios.post('/user/login', { email, phone: needsPhone ? phone : undefined });
            const userPhone = res.data?.phone;
            if (!userPhone && !phone && otpMethod === 'mobile') {
                setNeedsPhone(true);
                alert('Please enter your phone number for first login.');
                return;
            }
            if (otpMethod === 'email') {
                await axios.post('/api/otp/send', { email, method: 'email' });
                alert('Email OTP sent to ' + email);
            } else {
                let formattedPhone = userPhone || phone;
                if (/^\d{10}$/.test(formattedPhone)) {
                    formattedPhone = '+91' + formattedPhone;
                }
                await sendOtp(formattedPhone);
                alert('SMS OTP sent to ' + formattedPhone);
            }
            setOtpSent(true);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message === 'Phone number required for first login') {
                setNeedsPhone(true);
                alert('Please enter your phone number for first login.');
            } else {
                alert('Failed to send OTP');
            }
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /><br />
            {(needsPhone || !otpSent) ? (
                <>
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    /><br />
                </>
            ) : null}
            <button onClick={handleOtpSend}>Send OTP</button>
            {otpSent && <p>OTP sent. Please check your phone.</p>}
        </div>
    );
};

export default UserLogin;
