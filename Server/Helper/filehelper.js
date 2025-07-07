"use strict";
import multer from "multer";
import path from 'path'
import { convertToHLS } from "../video.js";

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
    },
});

const filefilter = (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

export const upload = multer({ storage: storage, fileFilter: filefilter });