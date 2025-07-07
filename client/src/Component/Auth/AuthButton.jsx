import React, { useState } from 'react';
import axios from 'axios';

const AuthButton = ({ email, mobile, method }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthClick = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const payload = { email, mobile, method };
            await axios.post('/api/otp/send', payload);
        } catch (error) {
            console.error('Error sending OTP:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handleAuthClick} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
    );
};

export default AuthButton;
