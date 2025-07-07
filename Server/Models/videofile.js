import mongoose from "mongoose"
const videofileschema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        videotitle: { type: String, required: true },
        description: { type: String, default: "" },
        videoid: { type: String, required: true },
        filename: { type: String, required: true },
        filepath: { type: String, required: true },
        filesize: { type: String, required: true },
        filetype: { type: String, required: true },

        videochanel: { type: String, required: true },
        uploader: { type: String, default: "Unknown Uploader" },

        video: { type: String, required: true },
        hlsUrl: { type: String, required: true },
        originalUrl: { type: String, required: true },
        thumbnail: { type: String, default: "" },
        quality: {
            type: Map,
            of: String,
            default: {},
        },
        qualities: [
            {
                quality: { type: String },
                filepath: { type: String },
            }
        ],

        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
        tags: { type: [String], default: [] },

    },
    {
        timestamps: true,
    }
)
export default mongoose.model("Videofile", videofileschema)
