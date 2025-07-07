import mongoose from "mongoose";

const commentschema = mongoose.Schema({
    videoid: String,
    userid: String,
    commentbody: String,
    usercommented: String,
    translate: String,
    usercity: String,
    commentedon: { type: Date, default: Date.now },
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
})

commentschema.post('findOneAndUpdate', async function (doc) {
    if (doc && doc.dislike >= 2) {
        await doc.deleteOne();
    }
});

export default mongoose.model("Comments", commentschema)
