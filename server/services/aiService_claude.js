const { Anthropic } = require("@anthropic-ai/sdk");
const Message = require("../models/Message");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

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

        const chatHistory = messages
            .reverse()
            .map((m) => `${m.sender.name}: ${m.content}`)
            .join("\n");

        const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 150,
            messages: [
                {
                    role: "user",
                    content: `Summarize the following chat transcript into 3 concise bullet points for a quick catch-up. Use simple, direct language:\n\n${chatHistory}`
                }
            ],
        });

        const summary = response.content[0].text;
        res.status(200).json({ summary });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "AI Summary currently unavailable.", error: error.message });
    }
};

module.exports = { summarizeChat };
