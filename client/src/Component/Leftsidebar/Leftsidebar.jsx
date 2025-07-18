import React from 'react'
import "./Leftsidebar.css"
import shorts from "./shorts.png"
import { AiOutlineHome } from "react-icons/ai"
import { MdOutlineExplore, MdOutlineSubscriptions, MdOutlineVideoLibrary, MdVideoCall } from "react-icons/md"
import { NavLink } from 'react-router-dom'
const Leftsidebar = () => {
    return (
        <div className="container_leftSidebar">
            <NavLink to={'/'} className="icon_sidebar_div">
                <AiOutlineHome size={22} className='icon_sidebar' />
                <div className="text_sidebar_icon">Home</div>
            </NavLink>
            <div className="icon_sidebar_div">
                <MdOutlineExplore size={22} className='icon_sidebar' />
                <div className="text_sidebar_icon">Explore</div>
            </div>
            <div className="icon_sidebar_div">
                <img src={shorts} width={22} alt='shorts' className='icon_sidebar' />
                <div className="text_sidebar_icon">Shorts</div>
            </div>
            <div className="icon_sidebar_div">
                <MdOutlineSubscriptions size={22} className='icon_sidebar' />
                <div className="text_sidebar_icon">Subscription</div>
            </div>
            <NavLink to={'/Library'} className="icon_sidebar_div">
                <MdOutlineVideoLibrary size={22} className='icon_sidebar' />
                <div className="text_sidebar_icon">Library</div>
            </NavLink>
            <NavLink to={'/video-call'} className="icon_sidebar_div">
                <MdVideoCall size={22} className='icon_sidebar' />
                <div className="text_sidebar_icon">Video Call</div>
            </NavLink>
        </div>
    )
}

export default Leftsidebar