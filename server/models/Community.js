const mongoose = require('mongoose');

const communitySchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String, required: true },
        bio: { type: String },
        banner: { type: String },
        avatar: { type: String },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isPublic: { type: Boolean, default: true },
        bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
