const Broadcast = require('../models/Broadcast');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');

const sendBroadcast = async (req, res) => {
    const { content, recipients, broadcastName, type } = req.body;

    if (!content || !recipients || recipients.length === 0) {
        return res.status(400).json({ message: "Content and recipients are required" });
    }

    try {
        const broadcast = await Broadcast.create({
            sender: req.user._id,
            recipients,
            content,
            broadcastName,
            type: type || "archived",
        });

        // Distribute message to individual chats
        const io = req.app.get('io');

        const distributionPromises = recipients.map(async (recipientId) => {
            // Find or create a 1-on-1 chat with this recipient
            let chat = await Chat.findOne({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user._id } } },
                    { users: { $elemMatch: { $eq: recipientId } } },
                ],
            });

            if (!chat) {
                chat = await Chat.create({
                    chatName: "sender",
                    isGroupChat: false,
                    users: [req.user._id, recipientId],
                });
            }

            // Create and populate the message
            let message = await Message.create({
                sender: req.user._id,
                content: content,
                chat: chat._id,
                isBroadcast: true,
                isSelfDestruct: type === "one-time"
            });

            await message.populate([
                { path: "sender", select: "name avatar" },
                { path: "chat" }
            ]);

            await User.populate(message, {
                path: "chat.users",
                select: "name avatar email",
            });

            await Chat.findByIdAndUpdate(chat._id, { latestMessage: message._id });

            // Emit to recipient and sender's other tabs
            if (io) {
                io.to(recipientId.toString()).emit("message recieved", message);
                io.to(req.user._id.toString()).emit("message recieved", message);
            }

            return message;
        });

        await Promise.all(distributionPromises);

        res.status(201).json(broadcast);
    } catch (error) {
        console.error("sendBroadcast Error Details:", error);
        res.status(400).json({ message: error.message });
    }
};

const getBroadcastHistory = async (req, res) => {
    try {
        const history = await Broadcast.find({ sender: req.user._id })
            .populate("recipients", "name avatar")
            .sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        console.error("getBroadcastHistory Error Details:", error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { sendBroadcast, getBroadcastHistory };
