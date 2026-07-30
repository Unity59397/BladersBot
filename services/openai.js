const OpenAI = require("openai");
const logger = require("../utils/logger");

const client = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

async function generateQuestion() {
    if (!client) {
        logger.warn("OPENAI_API_KEY is not configured; using fallback question generation.");
        return null;
    }

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that creates short, engaging daily discussion questions for a Discord community. Return only one concise question, no extra text."
                },
                {
                    role: "user",
                    content: "Generate one thoughtful question of the day for a friendly Discord community."
                }
            ],
            temperature: 0.8,
            max_tokens: 60
        });

        const question = response.choices?.[0]?.message?.content?.trim();

        if (!question) {
            throw new Error("OpenAI returned no question content.");
        }

        return question;
    }
    catch (error) {
        logger.error(`OpenAI question generation failed: ${error.message}`);
        return null;
    }
}

module.exports = {
    generateQuestion
};
