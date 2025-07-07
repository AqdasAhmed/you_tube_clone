import React, { useState } from "react";
import "./Videoupload.css";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { useSelector, useDispatch } from "react-redux";
import { uploadvideo } from "../../action/video";
import * as api from "../../Api";

const MAX_SIZE = 100 * 1024 * 1024;

const Videoupload = ({ setvideouploadpage }) => {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [processingText, setProcessingText] = useState("");

  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.currentuserreducer);

  const pollForVideo = (ttl, max = 30, gap = 2000) => {
    let tries = 0;
    setProcessingText("Upload complete.\nConverting and uploading video…");

    const tick = async () => {
      try {
        const { data } = await api.getvideos();
        if (data.find((v) => v.videotitle === ttl)) {
          setPhase("done");
          setProcessingText("Video processed 🎉");
          setTimeout(() => setvideouploadpage(false), 1500);
          return;
        }
      } catch (_) {
        setProcessingText("Processing… (network issue, retrying)");
      }

      if (++tries < max) setTimeout(tick, gap);
      else {
        setProcessingText(
          "Processing is taking longer than expected.\n" +
          "You may safely close this window – the video will appear once ready."
        );
        setTimeout(() => setvideouploadpage(false), 4000);
      }
    };

    tick();
  };

  const doUpload = async () => {
    if (!title.trim()) return alert("Please enter a title.");
    if (!videoFile) return alert("Please choose a video file.");
    if (videoFile.size > MAX_SIZE)
      return alert("File is too large (limit 100 MB).");

    const fd = new FormData();
    fd.append("file", videoFile);
    fd.append("title", title.trim());
    fd.append("chanel", currentUser?.result?._id);
    fd.append("uploader", currentUser?.result?.name);

    setPhase("uploading");
    setProgress(0);

    try {
      await dispatch(
        uploadvideo({
          filedata: fd,
          fileoption: {
            onUploadProgress: ({ loaded, total }) => {
              setProgress(Math.floor((loaded / total) * 100));
            }
          }
        })
      );

      setPhase("processing");
      pollForVideo(title.trim());
    } catch (err) {
      console.error(err);
      setPhase("idle");
      alert("Upload failed – please try again.");
    }
  };

  return (
    <div className="container_VidUpload">
      <button className="ibtn_x" onClick={() => setvideouploadpage(false)}>×</button>

      <div className="container2_VidUpload">
        <div className="ibox_div_vidupload">
          <input
            type="text"
            maxLength={30}
            placeholder="Enter video title"
            className="ibox_vidupload"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="ibox_cidupload btn_vidUpload">
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="ibox_vidupload"
            />
            Choose MP4
          </label>
        </div>

        <div className="ibox_div_vidupload">
          <button
            className="ibox_vidupload btn_vidUpload"
            onClick={doUpload}
            disabled={phase === "uploading" || phase === "processing"}
          >
            {phase === "uploading" ? "Uploading…" :
              phase === "processing" ? "Processing…" : "Upload"}
          </button>

          <div className="loader ibox_div_vidupload">
            {phase === "uploading" && (
              <CircularProgressbar
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({
                  textColor: "#fff",
                  pathColor: "#3e98c7",
                  trailColor: "#444"
                })}
              />
            )}

            {phase === "processing" && (
              <div className="processing-wrap">
                <div className="spinner" />
                <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                  {processingText}
                </p>
              </div>
            )}
          </div>

          {(phase === "uploading" || phase === "processing" || phase === "done") && (
            <div className="upload-steps">
              <div className={`step ${phase !== "idle" ? (phase === "uploading" ? "active" : "done") : ""}`}>1. Upload</div>
              <div className={`step ${phase === "processing" ? "active" : phase === "done" ? "done" : ""}`}>2. Process</div>
              <div className={`step ${phase === "done" ? "done" : ""}`}>3. Ready</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videoupload;
