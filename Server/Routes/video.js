import express from "express"
import { likevideocontroller } from "../Controllers/like.js";
import { viewscontroller } from "../Controllers/views.js";
import { uploadvideo, getallvideos, getHlsUrlById, downloadVideo, getUserDownloads, deleteDownload } from "../Controllers/video.js";
import { historycontroller, deletehistory, getallhistorycontroller } from "../Controllers/History.js";
import { watchlatercontroller, getallwatchlatercontroller, deletewatchlater } from "../Controllers/watchlater.js";
import { likedvideocontroller, getalllikedvideo, deletelikedvideo } from "../Controllers/likedvideo.js";
import { upload } from "../Helper/filehelper.js";
import auth from "../middleware/auth.js"
const routes = express.Router();

routes.post("/uploadvideo", auth, upload.single("file"), uploadvideo)

routes.get("/getvideos", getallvideos)
routes.patch('/like/:id', auth, likevideocontroller)
routes.patch('/view/:id', viewscontroller)

routes.post('/history', auth, historycontroller)
routes.get('/getallhistory', getallhistorycontroller)
routes.delete('/deletehistory/:userid', auth, deletehistory)

routes.post('/watchlater', auth, watchlatercontroller)
routes.get('/getallwatchlater', getallwatchlatercontroller)
routes.delete('/deletewatchlater/:videoid/:viewer', auth, deletewatchlater)

routes.post('/likevideo', auth, likedvideocontroller)
routes.get('/getalllikevideo', getalllikedvideo)
routes.delete('/deletelikevideo/:videoid/:viewer', auth, deletelikedvideo)

routes.get("/gethlsurl/:id", getHlsUrlById);
routes.get('/download/:videoId', auth, downloadVideo);
routes.get('/downloads/:userId', auth, getUserDownloads);
routes.delete('/deletedownload/:downloadId', auth, deleteDownload);

export default routes
