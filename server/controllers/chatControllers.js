const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const Community = require('../models/Community');
const { onlineUsers } = require("../socket/socketHandler");

const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name avatar email username bio",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

const fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .populate("community")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name avatar email username bio",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    const { content, chatId, fileUrl, fileType, fileName, fileSize, isSelfDestruct } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        isSelfDestruct: isSelfDestruct || false,
        expireAt: null
    };

    try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.disappearingMessages) {
            // Set expiration to 24 hours from now
            newMessage.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name avatar");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name avatar email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        const io = req.app.get('io');
        if (message.chat.isGroupChat === false) {
            // Check if blocked
            const recipientId = message.chat.users.find(u => u._id.toString() !== req.user._id.toString());
            const recipientUser = await User.findById(recipientId);
            if (recipientUser && recipientUser.blockedUsers.includes(req.user._id)) {
                return res.status(403).json({ message: "You are blocked by this user" });
            }

            // Check if this is the first message
            const recipient = message.chat.users.find(u => u._id.toString() !== req.user._id.toString());
            if (recipient) {
                io.to(recipient._id.toString()).emit("new chat created", message.chat);
            }
        }

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            chat: req.params.chatId,
            hiddenFor: { $ne: req.user._id }
        })
            .populate("sender", "name avatar email")
            .populate("chat")
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    const messageId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res.status(400).send("Invalid Message ID");
    }

    try {
        // "Delete for Me" logic: Add user to hiddenFor array
        const message = await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { hiddenFor: userId } },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message: "Message hidden for you" });
    } catch (error) {
        console.error("Delete Me Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const editMessage = async (req, res) => {
    const { content } = req.body;
    const messageId = req.params.id;

    // Validate ObjectId format for Atlas
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: "Invalid Message ID format" });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content cannot be empty" });
    }

    try {
        // Use lean() for better Atlas performance
        const message = await Message.findById(messageId).lean();
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Verify sender ownership
        if (!message.sender || message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only sender can edit their message" });
        }

        // Update with proper Atlas query
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { 
                $set: { 
                    content: content.trim(),
                    isEdited: true,
                    editedAt: new Date()
                }
            },
            { 
                new: true,
                runValidators: true 
            }
        )
        .populate("sender", "name avatar email")
        .populate({
            path: "chat",
            populate: { path: "users", select: "name avatar email" }
        });

        if (!updatedMessage) {
            return res.status(500).json({ message: "Failed to update message" });
        }

        res.status(200).json(updatedMessage);
    } catch (error) {
        console.error("Edit Message Error:", error);
        
        // Handle specific Atlas errors
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid message ID format" });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Invalid content data" });
        }
        if (error.code === 11000) {
            return res.status(500).json({ message: "Duplicate key error" });
        }
        
        res.status(500).json({ message: "Failed to edit message" });
    }
};

const deleteMessageForEveryone = async (req, res) => {
    const messageId = req.params.id;

    // Validate ObjectId format for Atlas
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: "Invalid Message ID format" });
    }

    try {
        // Use lean() for better Atlas performance
        const message = await Message.findById(messageId).lean();
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Verify sender ownership
        if (!message.sender || message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only sender can delete for everyone" });
        }

        // Update with proper Atlas query
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { 
                $set: { 
                    content: "This message was deleted",
                    type: "deleted",
                    deletedAt: new Date()
                }
            },
            { 
                new: true,
                runValidators: true 
            }
        )
        .populate("sender", "name avatar email")
        .populate({
            path: "chat",
            populate: { path: "users", select: "name avatar email" }
        });

        if (!updatedMessage) {
            return res.status(500).json({ message: "Failed to delete message" });
        }

        res.status(200).json(updatedMessage);
    } catch (error) {
        console.error("Delete Everyone Error:", error);
        
        // Handle specific Atlas errors
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid message ID format" });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Invalid data" });
        }
        if (error.code === 11000) {
            return res.status(500).json({ message: "Duplicate key error" });
        }
        
        res.status(500).json({ message: "Failed to delete message" });
    }
};

// Community Controllers
const createCommunity = async (req, res) => {
    const { name, description, bio, banner, avatar, isPublic } = req.body;
    if (!name || !description) return res.status(400).send("Name and description required");

    try {
        const community = await Community.create({
            name, description, bio, banner, avatar, isPublic,
            creator: req.user._id,
            members: [req.user._id]
        });

        // Create a corresponding chat for the community
        const communityChat = await Chat.create({
            chatName: name,
            isGroupChat: true,
            isCommunity: true,
            community: community._id,
            groupAdmin: req.user._id,
            users: [req.user._id]
        });

        const io = req.app.get('io');
        // Notify creator to join the room
        io.to(req.user._id.toString()).emit("community created", communityChat);

        res.status(201).json({ community, communityChat });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const checkCommunityName = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).send("Name required");
    try {
        const community = await Community.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        res.json({ available: !community });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPublicCommunities = async (req, res) => {
    try {
        const communities = await Community.find({ isPublic: true }).populate("creator", "name avatar");
        res.json(communities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const joinCommunity = async (req, res) => {
    const { communityId } = req.body;
    try {
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).send("Community not found");
        if (community.bannedUsers.includes(req.user._id)) return res.status(403).send("You are banned from this community");

        if (!community.members.includes(req.user._id)) {
            community.members.push(req.user._id);
            await community.save();
        }

        // Add user to the community chat
        const chat = await Chat.findOne({ community: communityId });
        if (chat && !chat.users.includes(req.user._id)) {
            chat.users.push(req.user._id);
            await chat.save();
        }

        res.json({ message: "Joined successfully", chat });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const banUserFromCommunity = async (req, res) => {
    const { communityId, userId } = req.body;
    try {
        const community = await Community.findById(communityId);
        if (community.creator.toString() !== req.user._id.toString()) return res.status(403).send("Only admin can ban users");

        community.members = community.members.filter(m => m.toString() !== userId);
        if (!community.bannedUsers.includes(userId)) community.bannedUsers.push(userId);
        await community.save();

        const chat = await Chat.findOne({ community: communityId });
        if (chat) {
            chat.users = chat.users.filter(u => u.toString() !== userId);
            await chat.save();
        }

        const io = req.app.get('io');
        io.to(userId).emit("kicked from community", communityId);

        res.json({ message: "User banned and kicked" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const renameChat = async (req, res) => {
    const { chatId, chatName } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).send("Chat Not Found");
        } else {
            res.json(updatedChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const leaveChat = async (req, res) => {
    const { chatId } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).send("Chat Not Found");

        // Remove from members
        chat.users = chat.users.filter(u => u.toString() !== req.user._id.toString());

        // Handle community specific logic
        if (chat.isCommunity && chat.community) {
            await Community.findByIdAndUpdate(chat.community, {
                $pull: { members: req.user._id }
            });
        }

        // Admin Reassignment Logic
        if (chat.groupAdmin && chat.groupAdmin.toString() === req.user._id.toString()) {
            if (chat.users.length > 0) {
                chat.groupAdmin = chat.users[0]; // Next oldest/member
            } else {
                chat.groupAdmin = null;
            }
        }

        await chat.save();

        const fullChat = await Chat.findById(chatId)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        // Emit socket event user left
        const io = req.app.get('io');
        if (io) {
            io.to(chatId).emit("user left", {
                chatId,
                userId: req.user._id,
                newMemberCount: chat.users.length,
                newAdmin: chat.groupAdmin
            });
        }

        res.json(fullChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getChatMembers = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId).populate("users", "name username avatar");
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const membersWithStatus = chat.users.map(u => {
            const userObj = u.toObject();
            userObj.isOnline = onlineUsers.has(u._id.toString());
            return userObj;
        });

        res.json(membersWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const toggleDisappearingMessages = async (req, res) => {
    const { chatId } = req.body;
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        chat.disappearingMessages = !chat.disappearingMessages;
        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const blockUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user.blockedUsers.includes(userId)) {
            user.blockedUsers.push(userId);
            await user.save();
        }
        res.json({ message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    accessChat, fetchChats, createGroupChat, sendMessage, allMessages, deleteMessage,
    editMessage, deleteMessageForEveryone,
    createCommunity, getPublicCommunities, joinCommunity, banUserFromCommunity,
    checkCommunityName, renameChat, leaveChat, getChatMembers,
    toggleDisappearingMessages, blockUser
};


