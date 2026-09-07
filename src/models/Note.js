import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        content: {
            type: String,
            default: ""
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tags: [
            {
                type: String,
                trim: true
            }
        ],

        isPinned: {
            type: Boolean,
            default: false
        },

        isArchived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

noteSchema.index({
    user: 1,
    updatedAt: -1
});

const Note = mongoose.model("Note", noteSchema);

export default Note;