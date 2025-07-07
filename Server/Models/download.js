import mongoose from "mongoose";
import "../Models/videofile.js";

const downloadSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Videofile", required: true },
    downloadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Download", downloadSchema);
