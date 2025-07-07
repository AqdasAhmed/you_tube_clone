import React, { useState, useEffect } from 'react'
import './Comment.css'
import moment from 'moment'
import { useSelector, useDispatch } from 'react-redux'
import { editcomment, deletecomment } from '../../action/comment'
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from "react-icons/ai"
import axios from 'axios'

const Displaycomment = ({ cid, commentbody, userid, commenton, usercommented, usercity, like = 0, dislike = 0 }) => {
    const [edit, setedit] = useState(false)
    const [cmtnody, setcommentbdy] = useState("")
    const [cmtid, setcmntid] = useState("")
    const dispatch = useDispatch()
    const currentuser = useSelector(state => state.currentuserreducer);
    const [likecomment, setlikecomment] = useState(false)
    const [dislikecomment, setdislikecomment] = useState(false)
    const [commentlanguage, setcommentlanguage] = useState("en")
    const [translatedText, setTranslatedText] = useState("");
    const [showTranslated, setShowTranslated] = useState(false);

    const [likeCount, setLikeCount] = useState(like);
    const [dislikeCount, setDislikeCount] = useState(dislike);

    React.useEffect(() => {
        setLikeCount(like);
        setDislikeCount(dislike);
    }, [like, dislike]);

    React.useEffect(() => {
        setlikecomment(false);
        setdislikecomment(false);
    }, [cid]);

    const getLocalLikeDislike = () => {
        const data = JSON.parse(localStorage.getItem("commentLikeDislike") || "{}");
        return data[cid] || { like: false, dislike: false };
    };
    const setLocalLikeDislike = (like, dislike) => {
        const data = JSON.parse(localStorage.getItem("commentLikeDislike") || "{}");
        data[cid] = { like, dislike };
        localStorage.setItem("commentLikeDislike", JSON.stringify(data));
    };

    useEffect(() => {
        const { like, dislike } = getLocalLikeDislike();
        setlikecomment(like);
        setdislikecomment(dislike);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cid]);

    const handleedit = (ctid, ctbdy) => {
        setedit(true)
        setcmntid(ctid)
        setcommentbdy(ctbdy)
    }
    const handleonsubmit = (e) => {
        e.preventDefault();
        if (!cmtnody) {
            alert("type your comment");
        } else {
            dispatch(editcomment({ id: cmtid, commentbody: cmtnody }))
            setcommentbdy("")
        }
        setedit(false)
    }

    const handledel = (id) => {
        dispatch(deletecomment(id))
    }

    const handleLike = () => {
        if (!currentuser) {
            alert("Please login to like comments");
            return;
        }
        if (!likecomment) {
            setlikecomment(true);
            setdislikecomment(false);
            setLikeCount(likeCount + 1);
            if (dislikecomment) setDislikeCount(dislikeCount - 1);
            setLocalLikeDislike(true, false);
            dispatch(editcomment({ id: cid, dislike: dislikeCount - (dislikecomment ? 1 : 0), like: likeCount + 1 }));
        }
    };

    const handleDislike = () => {
        if (!currentuser) {
            alert("Please login to dislike comments");
            return;
        }
        if (!dislikecomment) {
            setdislikecomment(true);
            setlikecomment(false);
            setDislikeCount(dislikeCount + 1);
            if (likecomment) setLikeCount(likeCount - 1);
            setLocalLikeDislike(false, true);
            dispatch(editcomment({ id: cid, dislike: dislikeCount + 1, like: likeCount - (likecomment ? 1 : 0) }));
        }
    };

    React.useEffect(() => {
        const translateComment = async () => {
            if (commentlanguage === "en") {
                setTranslatedText("");
                setShowTranslated(false);
                return;
            }
            try {
                const { data } = await axios.post("https://play-tube-clone.onrender.com/comment/translate", {
                    comment: commentbody,
                    to: commentlanguage
                });
                setTranslatedText(data.translated);
                setShowTranslated(true);
            } catch (error) {
                setTranslatedText("");
                setShowTranslated(false);
                alert("Error in translation");
                console.log(error);
            }
        };
        translateComment();
    }, [commentlanguage, commentbody]);


    return (
        <>
            {edit ? (
                <>
                    <form className="comments_sub_form_commments" onSubmit={handleonsubmit}>
                        <input type="text" onChange={(e) => setcommentbdy(e.target.value)} placeholder='Edit comments..' value={cmtnody} className="comment_ibox" />
                        <input type="submit" value="change" className="comment_add_btn_comments" />
                    </form>
                </>
            ) : (
                <>
                    <p className="comment_body">
                        {showTranslated && translatedText ? translatedText : commentbody}
                        <p className="like_dislike_translate" style={{ color: "white" }}>
                            <span onClick={handleLike} style={{ cursor: "pointer" }}>
                                {likecomment
                                    ? <AiFillLike />
                                    : <AiOutlineLike />
                                } {likeCount}
                            </span>
                            <span onClick={handleDislike} style={{ cursor: "pointer", marginLeft: 10 }}>
                                {dislikecomment
                                    ? <AiFillDislike />
                                    : <AiOutlineDislike />
                                } {dislikeCount}
                            </span>
                            <select
                                onChange={(e) => setcommentlanguage(e.target.value)}
                                className="translate_select"
                                value={commentlanguage}
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="bn">Bengali</option>
                                <option value="ta">Tamil</option>
                                <option value="te">Telugu</option>
                            </select>
                        </p>
                    </p>

                </>
            )}
            <p className="usercommented">{" "}- {usercommented} from {usercity} commented {moment(commenton).fromNow()}</p>
            {currentuser?.result?._id === userid && (
                <p className="EditDel_DisplayCommendt">
                    <i onClick={() => handleedit(cid, commentbody)}>Edit</i>
                    <i onClick={() => handledel(cid)}>Delete</i>
                </p>
            )}
        </>
    )
}

export default Displaycomment