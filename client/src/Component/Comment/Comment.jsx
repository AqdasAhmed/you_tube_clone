import React, { useState } from 'react'
import "./Comment.css"
import Displaycomment from './Displaycomment'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { postcomment } from '../../action/comment'
const Comment = ({ videoid }) => {
    const dispatch = useDispatch()
    const [commenttext, setcommentext] = useState("")
    const currentuser = useSelector(state => state.currentuserreducer);
    const commentlist = useSelector(state => state.commentreducer)
    const handleonsubmit = async (e) => {
        e.preventDefault();
        if (currentuser) {
            if (!commenttext) {
                alert("please type your comment!!")
            }
            else {
                let usercity = "Unknown";
                try {
                    const loc = JSON.parse(localStorage.getItem('userLocation'));
                    if (loc && loc.city) usercity = loc.city;
                } catch { }
                dispatch(postcomment({
                    videoid: videoid,
                    userid: currentuser?.result._id,
                    commentbody: commenttext,
                    usercommented: currentuser.result.name,
                    usercity: usercity,
                }))
                setcommentext("")
            }
        } else {
            alert("Please login to comment")
        }
    }


    return (
        <>
            <form className='comments_sub_form_comments' onSubmit={handleonsubmit}>
                <input type="text" onChange={(e) => setcommentext(e.target.value)} placeholder='add comment...' value={commenttext} className='comment_ibox' />
                <input type="submit" value="add" className='comment_add_btn_comments' />
            </form>
            <div className="display_comment_container">
                {Array.isArray(commentlist?.data) ? commentlist.data.filter((q) => videoid === q?.videoid)
                    .reverse()
                    .map((m) => {
                        return (
                            <Displaycomment
                                cid={m._id}
                                userid={m.userid}
                                commentbody={m.commentbody}
                                commenton={m.commentedon}
                                usercommented={m.usercommented}
                                usercity={m.usercity}
                                like={m.like}
                                dislike={m.dislike}
                            />
                        )
                    }) : null}
            </div>
        </>
    )
}

export default Comment