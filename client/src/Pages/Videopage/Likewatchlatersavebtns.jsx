import React, { useEffect, useState } from 'react'
import { BsThreeDots } from "react-icons/bs"
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from "react-icons/ai"
import { MdPlaylistAddCheck } from "react-icons/md"
import { RiHeartAddFill, RiPlayListAddFill, RiShareForwardLine, RiDownloadLine } from "react-icons/ri"
import "./Likewatchlatersavebtn.css"
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux'
import { likevideo } from '../../action/video'
import { addtolikedvideo, deletelikedvideo } from "../../action/likedvideo"
import { addtowatchlater, deletewatchlater } from '../../action/watchlater'
import PremiumModal from "../../Component/PremiumModal";
import * as api from '../../Api/index'

const Likewatchlatersavebtns = ({ vv, vid }) => {
  const dispatch = useDispatch();
  const [savevideo, setsavevideo] = useState(false)
  const [dislikebtn, setdislikebtn] = useState(false)
  const [likebtn, setlikebtn] = useState(false)
  const [premiumModal, setPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumCheckError, setPremiumCheckError] = useState(null);
  const currentuser = useSelector(state => state.currentuserreducer);
  const likedvideolist = useSelector((state) => state.likedvideoreducer)
  const watchlaterlist = useSelector((s) => s.watchlaterreducer)
  console.log("isPremium", isPremium);
  useEffect(() => {
    if (currentuser?.result?._id) {
      likedvideolist?.data?.filter(
        (q) => q.videoid === vid && q.viewer === currentuser.result._id
      )
        .map((m) => setlikebtn(true));
      watchlaterlist?.data?.filter(
        (q) => q.videoid === vid && q.viewer === currentuser.result._id
      )
        .map((m) => setsavevideo(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkPremium = async () => {
      if (currentuser?.result?._id) {
        try {
          const res = await axios.get(`https://play-tube-clone.onrender.com/api/razorpay/user/${currentuser.result._id}`);
          setIsPremium(res.data?.user?.premium);
          setPremiumCheckError(null);
        } catch (err) {
          setIsPremium(false);
          setPremiumCheckError(err?.message || (err?.response && err.response.data?.message) || 'Unknown error');
          console.error('Premium check failed:', err);
        }
      }
    };
    checkPremium();
  }, [currentuser?.result?._id]);

  const togglesavedvideo = () => {
    if (currentuser) {
      if (savevideo) {
        setsavevideo(false);
        dispatch(deletewatchlater({ videoid: vid, viewer: currentuser?.result?._id }))
      } else {
        setsavevideo(true);
        dispatch(addtowatchlater({ videoid: vid, viewer: currentuser?.result?._id }))
      }
    } else {
      alert("please login to save video")
    }
  }

  const togglelikevideo = (e, lk) => {
    if (currentuser) {
      if (likebtn) {
        setlikebtn(false);
        dispatch(likevideo({ id: vid, Like: lk - 1 }))
        dispatch(deletelikedvideo({ videoid: vid, viewer: currentuser?.result?._id }))
      } else {
        setlikebtn(true);
        dispatch(likevideo({ id: vid, Like: lk + 1 }))
        dispatch(addtolikedvideo({ videoid: vid, viewer: currentuser?.result?._id }))
        setdislikebtn(false)
      }
    } else {
      alert("please login to like video")
    }
  }

  const toggledislikevideo = (e, lk) => {
    if (currentuser) {
      if (dislikebtn) {
        setdislikebtn(false);
      } else {
        setdislikebtn(true);
        if (likebtn) {
          dispatch(likevideo({ id: vid, Like: lk - 1 }))
          dispatch(deletelikedvideo({ videoid: vid, viewer: currentuser?.result?._id }))
        }
        setlikebtn(false)
      }
    } else {
      alert("please login to dislike video")
    }
  }

  const handleDownload = async () => {
    if (!currentuser || !vid) {
      alert("Please login to download video");
      return;
    }
    try {
      const res = await api.downloadVideo(vid);
      const url = res.data.downloadUrl;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', vv.videotitle + '.mp4');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setPremiumModal(true);
      } else {
        alert("Failed to download video");
      }
    }
  };

  return (
    <>
      <div className="btns_cont_videoPage">
        <div className="btn_VideoPage">
          <BsThreeDots />
        </div>
        <div className="btn_VideoPage">
          <div onClick={handleDownload} className="download_btn_videoPage">
            <RiDownloadLine size={22} className='btns_videoPage' />
            <b>Download</b>
          </div>
          <div className="like_videoPage" onClick={(e) => togglelikevideo(e, vv.Like)}>
            {likebtn ? (
              <>
                <AiFillLike size={22} className='btns_videoPage' />
              </>
            ) : (
              <>
                <AiOutlineLike size={22} className='btns_videoPage' />
              </>
            )}
            <b>{vv.Like}</b>
          </div>
          <div className="like_videoPage" onClick={(e) => toggledislikevideo(e, vv.Like)}>
            {dislikebtn ? (<>
              <AiFillDislike size={22} className='btns_videoPage' />
            </>) : (
              <>
                <AiOutlineDislike size={22} className='btns_videoPage' />
              </>
            )}
            <b>DISLIKE</b>
          </div>
          <div className="like_videoPage" onClick={(e) => togglesavedvideo(e)}>
            {savevideo ? (<>
              <MdPlaylistAddCheck size={22} className='btns_videoPage' />
              <b>Saved</b>
            </>) : (
              <>
                <RiPlayListAddFill size={22} className='btns_videoPage' />
                <b>Save</b>
              </>
            )}
          </div>
          <div className="like_videoPage">
            <>
              <RiHeartAddFill size={22} className="btns_videoPage" />
              <b>Thanks</b>
            </>
          </div>
          <div className="like_videoPage">
            <>
              <RiShareForwardLine size={22} className='btns_videoPage' />
              <b>Share</b>
            </>
          </div>
        </div>
      </div>
      {premiumModal && (
        <PremiumModal
          onClose={() => setPremiumModal(false)}
          onSuccess={async () => {
            setPremiumModal(false);

            if (currentuser?.result?._id) {
              try {
                const res = await axios.get(`https://play-tube-clone.onrender.com/api/razorpay/user/${currentuser.result._id}`);
                setIsPremium(res.data?.user?.premium);
              } catch {
                setIsPremium(false);
              }
            }
          }}
        />
      )}
      {premiumCheckError && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>Premium check failed: {premiumCheckError}</div>
      )}
    </>
  )
}

export default Likewatchlatersavebtns