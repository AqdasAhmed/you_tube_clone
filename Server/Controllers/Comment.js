import comment from "../Models/comment.js";
import mongoose from "mongoose";
import { translate } from '@vitalets/google-translate-api';

const hasSpecialChars = (str) => /[!@#$%^&*_=~`<>\[\]{}|\\]/.test(str);

export const postcomment = async (req, res) => {
    const { videoid, userid, commentbody, usercommented, translate, usercity, commentedon, like, dislike } = req.body

    if (hasSpecialChars(commentbody)) {
        return res.status(400).json("Comment contains special characters and is not allowed.");
    }

    const postcomment = new comment(
        { videoid, userid, commentbody, usercommented, translate, usercity, commentedon, like, dislike }
    )
    try {
        await postcomment.save()
        res.status(200).json("posted the comment")
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const getcomment = async (req, res) => {
    try {
        const commentlist = await comment.find()
        res.status(200).send(commentlist)
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const deletecomment = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..")
    }
    try {
        await comment.findByIdAndDelete(_id);
        res.status(200).json({ message: "deleted comment" })
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const editcomment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody, dislike, like } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..")
    }

    if (commentbody && hasSpecialChars(commentbody)) {
        return res.status(400).json("Comment contains special characters and is not allowed.");
    }

    try {
        if (typeof dislike === "number" && dislike >= 2) {
            await comment.findByIdAndDelete(_id);
            return res.status(200).json({ message: "Comment deleted due to excessive dislikes." });
        }

        const updateFields = {};
        if (commentbody) updateFields.commentbody = commentbody;
        if (typeof dislike === "number") updateFields.dislike = dislike;
        if (typeof like === "number") updateFields.like = like;

        const updatecomment = await comment.findByIdAndUpdate(
            _id,
            { $set: updateFields }
        )
        res.status(200).json(updatecomment)
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const translatecomment = async (req, res) => {
    console.log("Translate endpoint hit:", req.body);
    const { comment, to } = req.body;

    if (!comment || !to) {
        return res.status(400).json({ error: "Comment and target language are required" });
    }

    try {
        const result = await translate(comment, { to });
        res.status(200).json({ translated: result.text });
    } catch (error) {
        res.status(400).json(error.message)
    }
}