const Message = require("../models/Message");

const summarizeChat = async (req, res) => {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    try {
        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate("sender", "name");

        if (messages.length === 0) {
            return res.status(200).json({ summary: "No messages to summarize" });
        }

        // Extract key topics and participants
        const participants = [...new Set(messages.map(m => m.sender.name))];
        const messageContents = messages.map(m => m.content.toLowerCase());
        
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
        const summary = `• ${participants.join(', ')} discussed ${topKeywords.join(', ')}\n• ${messages.length} messages exchanged\nn• Most recent activity: ${messages[0].sender.name} sent a message`;

        res.status(200).json({ summary });

    } catch (error) {
        console.error("Summary Error:", error);
        res.status(500).json({ message: "Summary generation failed.", error: error.message });
    }
};

module.exports = { summarizeChat };
