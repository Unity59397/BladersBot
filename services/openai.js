const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const client = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

async function generateQuestion() {
    if (!client) {
        logger.warn("GEMINI_API_KEY is not configured; using fallback question generation.");
        return null;
    }

    try {
        const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(
            "You create two short, engaging discussion prompts for a Discord community. Return them as two numbered lines in this exact format: 1. [General question] 2. [Beyblade-themed question]. Do not include any extra explanation. Generate two thoughtful questions: one general, one Beyblade-themed."
        );

        // Extract text from response
        const text = result.response.text();
        
        if (!text || text.trim() === "") {
            throw new Error("Gemini returned empty response");
        }

        logger.info(`Gemini generated: ${text}`);
        return text.trim();
    }
    catch (error) {
        logger.error(`Gemini question generation failed: ${error.message}`);
        return null;
    }
}

module.exports = {
    generateQuestion
};