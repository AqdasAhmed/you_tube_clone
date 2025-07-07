import axios from 'axios';

export const triggerOtp = async ({ email, mobile, method }) => {
    try {
        const res = await axios.post('https://play-tube-clone.onrender.com/api/otp/send', {
            email,
            mobile,
            method,
        });
        return res.data;
    } catch (err) {
        console.error("OTP trigger failed:", err);
        throw err;
    }
};

export const getUserLocation = async () => {
    const cacheKey = 'userLocation';
    const cacheTimeKey = 'userLocationTime';
    const maxAge = 24 * 60 * 60 * 1000;
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    if (cached && cacheTime && (Date.now() - Number(cacheTime) < maxAge)) {
        try {
            return JSON.parse(cached);
        } catch {
            console.warn("Failed to parse cached userLocation");
        }
    }
    try {
        const res = await fetch('https://play-tube-clone.onrender.com/user/location');
        if (!res.ok) throw new Error('Failed to fetch location from ipinfo.io');
        const { city, state } = await res.json();
        if (city || state) {
            localStorage.setItem('userLocation', JSON.stringify({ city, state }));
            localStorage.setItem('userLocationTime', Date.now().toString());
        }
        return { city, state };
    } catch (error) {
        console.error("Failed to fetch location from ipinfo.io:", error);
        return { city: null, state: null };
    }

    // ----------- Comment the lines above to force a specific location for testing purposes ----------- 

    // ---------- Uncomment the lines below to force a specific location for testing purposes ---------- 

    // console.log("getUserLocation called (FORCED Tamil Nadu OVERRIDE)");
    // // Force location for testing email OTP logic
    // const city = "Chennai";
    // const state = "Tamil Nadu";
    // localStorage.setItem('userLocation', JSON.stringify({ city, state }));
    // localStorage.setItem('userLocationTime', Date.now().toString());
    // return { city, state };
};
