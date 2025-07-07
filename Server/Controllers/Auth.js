import users from "../Models/Auth.js"
import jwt from "jsonwebtoken"
import axios from "axios"

const ipLocationCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const getCityFromIP = async (ip) => {
    try {
        const url = `https://ipinfo.io/json?token=${process.env.IP_INFO_TOKEN}`;
        const { data } = await axios.get(url);
        return data.city || "Unknown";
    } catch (error) {
        console.log("Error getting city:", error.message);
        return "Unknown";
    }
};

export const login = async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const usercity = await getCityFromIP(ip);

    const { email, phone } = req.body;
    try {
        let user = await users.findOne({ email });
        if (!user) {
            if (!phone) {
                return res.status(400).json({ success: false, message: "Phone number required for first login" });
            }
            user = await users.create({ email, usercity, phone });
        } else {
            if (user.usercity !== usercity) {
                await users.updateOne({ _id: user._id }, { $set: { usercity } });
                user.usercity = usercity;
            }
        }
        const token = jwt.sign({
            email: user.email, id: user._id, usercity
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.status(200).json({ result: user, token, phone: user.phone });
    } catch (error) {
        res.status(500).json({ mess: "something went wrong..." });
    }
}

export const getUserLocation = async (req, res) => {
    const now = Date.now();
    const cacheKey = 'auto';
    if (ipLocationCache[cacheKey] && (now - ipLocationCache[cacheKey].timestamp < CACHE_DURATION)) {
        const { city, state } = ipLocationCache[cacheKey];
        return res.status(200).json({ city, state });
    }
    try {
        const url = `https://ipinfo.io/json?token=${process.env.IP_INFO_TOKEN}`;
        const { data } = await axios.get(url);
        const city = data.city || data.town || data.village || data.locality || "Unknown";
        const state = data.region || data.state || data.province || "Unknown";
        ipLocationCache[cacheKey] = { city, state, timestamp: now };
        res.status(200).json({ city, state });
    } catch (error) {
        ipLocationCache[cacheKey] = { city: null, state: null, timestamp: now };
        res.status(200).json({ city: null, state: null, error: error.message });
    }
};
