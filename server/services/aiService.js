const Message = require("../models/Message");

const summarizeChat = async (req, res) => {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    console.log("Summarize request received:", { chatId, limit, user: req.user?.id });

    try {
        // Check if chatId is valid
        if (!chatId || chatId.length !== 24) {
            console.log("Invalid chatId format:", chatId);
            return res.status(400).json({ message: "Invalid chat ID format" });
        }

        console.log("Fetching messages...");
        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate("sender", "name")
            .lean();

        console.log("Messages found:", messages.length);

        if (!messages || messages.length === 0) {
            console.log("No messages found for chat:", chatId);
            return res.status(200).json({ summary: "No messages to summarize" });
        }

        // Extract key topics and participants
        const participants = [...new Set(messages
            .filter(m => m.sender && m.sender.name)
            .map(m => m.sender.name)
        )];

        const messageContents = messages
            .filter(m => m.content)
            .map(m => m.content.toLowerCase());
        
        // Simple keyword extraction
        const keywords = messageContents.join(' ')
            .split(/\s+/)
            .filter(word => word.length > 4)
            .reduce((acc, word) => {
                acc[word] = (acc[word] || 0) + 1;
                return acc;
            }, {});
        
        const topKeywords = Object.entries(keywords)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);

        // Generate simple summary
        const summary = `• ${participants.join(', ') || 'Unknown participants'} discussed ${topKeywords.join(', ') || 'various topics'}\n• ${messages.length} messages exchanged\n• Most recent activity: ${messages[0]?.sender?.name || 'Someone'} sent a message`;

        console.log("Summary generated successfully");
        res.status(200).json({ summary });

    } catch (error) {
        console.error("Summary Error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: "Summary generation failed.", error: error.message });
    }
};

module.exports = { summarizeChat };
