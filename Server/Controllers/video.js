import { rejects } from "assert";
import videofile from "../Models/videofile.js";
import ffmpeg from 'fluent-ffmpeg'
import path, { resolve } from "path"
import { fileURLToPath } from 'url';
import { convertToHLS } from "../video.js";
import fs from "fs";
import Video from "../Models/videofile.js";
import Download from '../Models/download.js';
import User from "../Models/Auth.js";
import { uploadFolderToGCS, uploadFileToGCS } from '../gcs.js';
import { storage, bucketName } from '../gcs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadvideo = async (req, res) => {
    if (req.file === undefined) {
        res.status(404).json({ message: "Please upload an MP4 video file only." })
    } else {
        try {
            const inputPath = path.normalize(req.file.path).replace(/\\/g, '/');
            const videoId = path.parse(req.file.filename).name;
            const safeVideoId = videoId.replace(/\s+/g, '_');
            const gcsOriginalKey = `original/${safeVideoId}.mp4`;
            const originalUrl = await uploadFileToGCS(inputPath, gcsOriginalKey);

            console.log(videoId);
            // const outputDir = path.join(__dirname, '../uploads/hls', videoId);
            const outputDir = path.join(__dirname, '../uploads/hls', safeVideoId);

            fs.mkdirSync(outputDir, { recursive: true });

            console.log('⏳ Starting HLS conversion…');
            const { thumbnail } = await convertToHLS(inputPath, outputDir, videoId);
            console.log('✅ HLS conversion finished:', outputDir);

            console.log('⏳ Uploading HLS folder to GCS…');
            await uploadFolderToGCS(outputDir, `hls/${safeVideoId}`);
            console.log('✅ HLS folder uploaded to GCS');

            const gcsBase = `https://storage.googleapis.com/${bucketName}/hls/${safeVideoId}`;
            const gcsMasterUrl = `${gcsBase}/master.m3u8`;
            const gcsThumbnailUrl = `${gcsBase}/thumbnail.jpeg`;

            const normalizedFilePath = path.normalize(req.file.path).replace(/\\/g, '/');
            await videofile.create({
                title: req.body.title || "Untitled Video",
                videotitle: req.body.title || "Untitled Video",
                description: req.body.description || "",
                videoid: req.file.filename,
                filename: req.file.originalname,
                filesize: req.file.size,
                filepath: normalizedFilePath,
                filetype: req.file.mimetype,
                videochanel: req.body.chanel || "Unknown Channel",
                uploader: req.body.uploader || "Unknown Uploader",
                userid: req.userId,
                video: gcsMasterUrl,
                hlsUrl: gcsMasterUrl,
                originalUrl: originalUrl,
                tags: req.body.tags || [],
                thumbnail: gcsThumbnailUrl,
            });

            return res.status(200).json({
                message: 'Upload and conversion successful',
                hlsUrl: gcsMasterUrl,
                originalUrl: originalUrl,
            });
        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: 'Upload failed' });
        }
    }
}

export const getallvideos = async (req, res) => {
    try {
        const files = await videofile.find();
        res.status(200).send(files)
    } catch (error) {
        res.status(404).json(error.message)
        return
    }
}

export const getHlsUrlById = async (req, res) => {
    try {
        const video = await videofile.findById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });
        res.status(200).json({ hlsUrl: video.hlsUrl });
    } catch (err) {
        res.status(500).json({ message: "Error fetching HLS URL" });
    }
};

export const downloadVideo = async (req, res) => {
    const { videoId } = req.params;
    console.log("Download request for videoId:", videoId);
    const userId = req.userid;
    try {
        if (!videoId || typeof videoId !== "string" || videoId === "undefined") {
            return res.status(400).json({ message: "Invalid videoId" });
        }

        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: "Video not found" });

        const user = await User.findById(userId);
        if (!user) return res.status(403).json({ message: "User not found" });

        const isPremium = user.premium && user.premiumExpiresAt && user.premiumExpiresAt > new Date();
        if (!isPremium) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const downloadsToday = await Download.countDocuments({
                userId: user._id,
                downloadedAt: { $gte: todayStart, $lte: todayEnd }
            });
            if (downloadsToday >= 1) {
                return res.status(403).json({ message: "Free download limit reached. Upgrade to premium for unlimited downloads." });
            }
        }

        await Download.create({ userId: user._id, videoId: video._id });

        const file = storage.bucket(bucketName).file(
            video.originalUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '')
        );

        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 5,
        });

        return res.json({ downloadUrl: signedUrl });
    } catch (err) {
        console.error("Download failed:", err);
        res.status(500).json({ message: "Download failed", error: err.message });
    }
};

export const getUserDownloads = async (req, res) => {
    const { userId } = req.params;
    try {
        const downloads = await Download.find({ userId }).populate({
            path: "videoId",
            select: "videotitle _id videoid filename filesize filepath filetype videochanel uploader thumbnail",
            match: { _id: { $ne: null } }
        });
        res.status(200).json(downloads);
    } catch (err) {
        console.error("Error in getUserDownloads:", err);
        res.status(500).json({ message: "Failed to fetch downloads", error: err.message });
    }
};

export const deleteDownload = async (req, res) => {
    try {
        const { downloadId } = req.params;
        await Download.findByIdAndDelete(downloadId);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete download', error: err.message });
    }
}