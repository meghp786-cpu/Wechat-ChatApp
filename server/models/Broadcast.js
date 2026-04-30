const mongoose = require('mongoose');

const broadcastSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        content: { type: String, required: true },
        broadcastName: { type: String },
        type: { type: String, enum: ["one-time", "archived"], default: "archived" },
    },
    { timestamps: true }
);

const Broadcast = mongoose.model("Broadcast", broadcastSchema);
module.exports = Broadcast;
