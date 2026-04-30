const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isCommunity: { type: Boolean, default: false },
        community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
        disappearingMessages: { type: Boolean, default: false },
    },

    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
