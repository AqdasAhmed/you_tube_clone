import React from 'react'
import './Showvideo.css'
import { Link } from 'react-router-dom'
import moment from "moment"
const Showvideo = ({ vid }) => {
  return (
    <>
      <Link to={`/videopage/${vid._id}`}>
        <video src={vid.video} className='video_ShowVideo' poster={vid.thumbnail} />
      </Link>
      <div className="video_description">
        <div className="Chanel_logo_App">
          <div className="fstChar_logo_App">
            <>{vid?.uploader?.charAt(0).toUpperCase()}</>
          </div>
        </div>

        <div className="video_details">
          <p className="title_vid_ShowVideo">{vid?.videotitle}</p>
          <pre className="vid_views_UploadTime">{vid?.uploader}</pre>
          <pre className="vid_views_UploadTime">
            {vid?.views} views <div className="dot"></div>{moment(vid?.createdAt).fromNow()}
          </pre>
        </div>
      </div>
    </>
  )
}

export default Showvideo