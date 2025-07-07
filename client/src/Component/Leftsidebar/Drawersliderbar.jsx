import React from 'react'
import "./Leftsidebar.css"
import { AiFillPlaySquare, AiOutlineHome, AiFillLike } from 'react-icons/ai'
import { MdOutlineExplore, MdOutlineVideoLibrary, MdSubscriptions, MdOutlineWatchLater, MdVideoCall } from "react-icons/md"
import { FaHistory } from 'react-icons/fa'
import shorts from "./shorts.png"
import { NavLink } from 'react-router-dom'
const Drawersliderbar = ({ toggledraw, toggledrawersidebar }) => {
  return (
    <div className="container_DrawaerLeftSidebar" style={toggledrawersidebar}>
      <div className="container2_DrawaerLeftSidebar">
        <div className="Drawer_leftsidebar">
          <NavLink to={'/'} className="icon_sidebar_div">
            <span>
              <AiOutlineHome size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Home</div>
            </span>
          </NavLink>
          <div className="icon_sidebar_div">
            <span>
              <MdOutlineExplore size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Explore</div>
            </span>
          </div>
          <div className="icon_sidebar_div">
            <span>
              <img src={shorts} width={22} alt='shorts' className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Shorts</div>
            </span>
          </div>

          <div className="icon_sidebar_div">
            <span>
              <MdSubscriptions size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Subscriptions</div>
            </span>
          </div>

          <NavLink to={'/video-call'} className="icon_sidebar_div">
            <span>
              <MdVideoCall size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Video Call</div>
            </span>
          </NavLink>
        </div>
        <div className="libraryBtn_Drawerleftsidebar">
          <NavLink to={'/Library'} className="icon_sidebar_div">
            <span>
              <MdOutlineVideoLibrary size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Library</div>
            </span>
          </NavLink>
          <NavLink to={'/Watchhistory'} className="icon_sidebar_div">
            <span>
              <FaHistory size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">History</div>
            </span>
          </NavLink>
          <NavLink to={'/Yourvideo'} className="icon_sidebar_div">
            <span>
              <AiFillPlaySquare size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Your Videos</div>
            </span>
          </NavLink>
          <NavLink to={'/Watchlater'} className="icon_sidebar_div">
            <span>
              <MdOutlineWatchLater
                size={22}
                className={"icon_sidebar"}
                style={{ margin: "auto 0.7rem" }}
              />
              <div className="text_sidebar_icon">Watch Later</div>
            </span>
          </NavLink>
          <NavLink to={'/Likedvideo'} className="icon_sidebar_div">
            <span>
              <AiFillLike size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Liked Videos</div>
            </span>
          </NavLink>
        </div>
        <div className="subScriptions_lsdbar">
          <h3>Your Subscription</h3>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
        </div>
      </div>
      <div className="container3_DrawaerLeftSidebar" onClick={() => toggledraw()}></div>
    </div>
  )
}

export default Drawersliderbar