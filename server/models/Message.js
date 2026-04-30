const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isEncrypted: { type: Boolean, default: true },
        isBroadcast: { type: Boolean, default: false },
        isEdited: { type: Boolean, default: false },
        type: { type: String, default: 'text' }, // 'text', 'deleted', etc.
        fileUrl: { type: String },
        fileType: { type: String },
        fileName: { type: String },
        fileSize: { type: Number },
        isSelfDestruct: { type: Boolean, default: false },
        expireAt: { type: Date },
    },
    { timestamps: true }
);

messageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
