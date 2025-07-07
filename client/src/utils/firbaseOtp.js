import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { app } from '../firebase.js';

const auth = getAuth(app);

export const sendOtp = async (phoneNumber) => {
    try {
        if (!auth) {
            throw new Error("Firebase auth is undefined! Check your firebase.js export and .env variables.");
        }

        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (clearErr) {
                console.warn('Failed to clear recaptchaVerifier:', clearErr);
            }
        }

        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    'recaptcha-container',
                    {
                        'size': 'invisible',
                        'callback': (response) => {

                        },
                        'expired-callback': () => {
                            console.warn('reCAPTCHA expired. Please try again.');
                        },
                    },
                );
                await window.recaptchaVerifier.render().then(widgetId => {
                    window.recaptchaWidgetId = widgetId;
                }).catch(renderErr => {
                    console.error('reCAPTCHA render error:', renderErr);
                    throw renderErr;
                });
            } catch (recaptchaErr) {
                console.error('Failed to initialize RecaptchaVerifier:', recaptchaErr);
                throw recaptchaErr;
            }
        }

        const appVerifier = window.recaptchaVerifier;
        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            return confirmationResult;
        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            throw error;
        }
    } catch (err) {
        console.error('OTP trigger error:', err);
        throw err;
    }
};
