import React, { useState, useEffect } from 'react';
import "./Videopage.css";
import moment from 'moment';
import Likewatchlatersavebtns from './Likewatchlatersavebtns';
import { useParams, Link } from 'react-router-dom';
import Comment from '../../Component/Comment/Comment';
import { viewvideo } from '../../action/video';
import { addtohistory } from '../../action/history';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../Component/Videoplayer/Videoplayer';
import * as api from '../../Api/index';

const Videopage = () => {
    const { vid } = useParams();
    const dispatch = useDispatch();

    const vids = useSelector((state) => state.videoreducer);
    const vv = Array.isArray(vids?.data) ? vids.data.find((q) => q._id === vid) : null;
    const currentuser = useSelector((state) => state.currentuserreducer);

    const [hlsUrl, setHlsUrl] = useState(null);

    const handleviews = () => {
        dispatch(viewvideo({ id: vid }));
    };

    const handlehistory = () => {
        dispatch(addtohistory({
            videoid: vid,
            viewer: currentuser?.result._id,
        }));
    };

    const fetchHlsUrl = async () => {
        try {
            const res = await api.gethlsurl(vid);
            if (res.data.hlsUrl) {
                setHlsUrl(res.data.hlsUrl);
            } else {
                console.warn("No HLS URL returned");
            }
        } catch (error) {
            console.error("Failed to fetch HLS URL:", error);
        }
    };

    useEffect(() => {
        if (currentuser) handlehistory();
        handleviews();
        fetchHlsUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vid, currentuser]);

    return (
        <div className="container_videoPage">
            <div className="container2_videoPage">
                <div className="video_display_screen_videoPage">
                    <VideoPlayer src={hlsUrl} />
                    <div className="video_details_videoPage">
                        {vv && (
                            <>
                                <div className="video_btns_title_VideoPage_cont">
                                    <p className="video_title_VideoPage">{vv.videotitle}</p>
                                    <div className="views_date_btns_VideoPage">
                                        <div className="views_videoPage">
                                            {vv.views} views <div className="dot"></div>{" "}
                                            {moment(vv.createdAt).fromNow()}
                                        </div>
                                        <Likewatchlatersavebtns vv={vv} vid={vid} />
                                    </div>
                                </div>
                                <Link to={'/'} className='chanel_details_videoPage'>
                                    <b className="chanel_logo_videoPage">
                                        <p>{vv?.uploader ? vv.uploader.charAt(0).toUpperCase() : 'U'}</p>
                                    </b>
                                    <p className="chanel_name_videoPage">{vv.uploader}</p>
                                </Link>
                                <div className="comments_VideoPage">
                                    <h2><u>Comments</u></h2>
                                    <Comment videoid={vv._id} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="moreVideoBar">More videos</div>
            </div>
        </div>
    );
};

export default Videopage;
