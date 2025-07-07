import mongoose from "mongoose";

const userschema = mongoose.Schema({
    email: { type: String, require: true },
    name: { type: String },
    desc: { type: String },
    joinedon: { type: Date, default: Date.now },
    usercity: { type: String },
    premium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },
    phone: { type: String },
})

export default mongoose.model("User", userschema)
