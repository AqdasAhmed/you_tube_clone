import React, { useEffect, useState } from "react";
import * as api from "../../Api/index";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";

const Downloads = () => {
    const currentuser = useSelector(state => state.currentuserreducer);
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        if (currentuser?.result?._id) {
            api.getUserDownloads(currentuser.result._id).then(res => {
                setDownloads(Array.isArray(res.data) ? res.data : res.data.downloads || []);
            });
        }
    }, [currentuser]);

    const handleDelete = async (downloadId) => {
        if (!window.confirm("Are you sure you want to delete this download from your history?")) return;
        try {
            await api.deleteDownload(downloadId);
            setDownloads(downloads.filter(d => d._id !== downloadId));
        } catch (err) {
            alert("Failed to delete download");
        }
    };

    return (
        <div className="downloads-container">
            <h2>Your Downloads History</h2>
            <ul className="downloads-list">
                {downloads.map(d => {
                    if (!d?.videoId || !d.videoId._id) return null;

                    return (
                        <li key={d._id}>
                            <Link to={`/videopage/${d.videoId._id}`}>
                                <video src={d.videoId?.video} className='video_ShowVideo' poster={d.videoId?.thumbnail} />
                            </Link>
                            <div className="video_description">
                                <div className="Chanel_logo_App">
                                    <div className="fstChar_logo_App">
                                        <>{d.videoId?.uploader?.charAt(0).toUpperCase()}</>
                                    </div>
                                </div>

                                <div className="video_details">
                                    <p className="title_vid_ShowVideo">{d.videoId?.videotitle}</p>
                                    <pre className="vid_views_UploadTime">{d.videoId?.uploader}</pre>
                                    <pre className="vid_views_UploadTime">{new Date(d.downloadedAt).toLocaleString()}</pre>
                                </div>
                                <MdDelete className="download_delete" onClick={() => handleDelete(d._id)} />
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default Downloads;