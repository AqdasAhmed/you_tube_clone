import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import videoroutes from './Routes/video.js';
import userroutes from "./Routes/User.js";
import path from 'path';
import commentroutes from './Routes/comment.js';
import otpRoutes from './Routes/otp.js';
import paymentRoutes from './Routes/payment.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }
));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/razorpay')) return next();
  express.json({ limit: "30mb" })(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api/razorpay')) return next();
  express.urlencoded({ limit: "30mb", extended: true })(req, res, next);
});

app.use(express.static(path.join(__dirname, "../client/build")));
console.log("Static files served from client/build");
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log("Uploads directory served");

app.use('/api/otp', otpRoutes);
console.log("OTP Routes Loaded");
app.use('/user', userroutes);
console.log("User Routes Loaded");
app.use('/video', videoroutes);
console.log("Video Routes Loaded");
app.use('/comment', commentroutes);
console.log("Comment Routes Loaded");

app.use('/api/razorpay', paymentRoutes);
console.log("Payment Routes Loaded");


app.get(async (req, res) => {
  try {
    const url = `https://ipinfo.io/json?token=${process.env.IP_INFO_TOKEN}`;
    const { data } = await axios.get(url);
    const city = data.city || data.town || data.village || null;
    const state = data.region || data.state || null;

    res.json({ city, state });
  } catch (err) {
    console.error('Location API', err);
    res.json({ city: null, state: null });
  }
});
console.log("Location API Loaded");

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  } else {
    next();
  }
});
console.log("Fallback route for React Loaded");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});

const DB_URL = process.env.DB_URL;
mongoose.connect(DB_URL).then(() => {
  console.log("MongoDB connected");
}).catch((error) => {
  console.error("MongoDB error:", error);
});