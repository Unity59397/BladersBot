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
        
        // Vary the prompt to get different types of questions
        const promptVariations = [
            "Generate two short, engaging discussion prompts for a Discord community about daily life and pop culture. Format: 1. [General question about hobbies, travel, or personal preferences] 2. [Beyblade-themed question about the anime, toys, or battles]",
            "Create two thought-provoking questions for a Discord server. Format: 1. [General question about technology, entertainment, or relationships] 2. [Beyblade question about favorite characters, seasons, or Beyblades]",
            "Write two fun conversation starters for a Discord community. Format: 1. [General question about food, music, games, or interesting experiences] 2. [Beyblade question about competitive strategy, legendary moments, or personal favorites]",
            "Generate two engaging questions to spark discussion. Format: 1. [General question about dreams, goals, or hypothetical scenarios] 2. [Beyblade question about lore, evolution of the series, or dream tournaments]",
            "Create two ice-breaker questions for Discord. Format: 1. [General question about hobbies, skills, or creative pursuits] 2. [Beyblade question about why you love the series, favorite bladers, or ultimate battles]"
        ];
        
        // Pick a random prompt variation
        const randomPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];
        
        logger.info(`Calling Gemini API with prompt variation...`);
        
        const result = await model.generateContent(randomPrompt);

        // Extract text from response
        const text = result.response.text();
        logger.info(`Extracted text: "${text}"`);
        
        if (!text || text.trim() === "") {
            logger.warn("Gemini returned empty text");
            return null;
        }

        logger.info(`Gemini generated: ${text}`);
        return text.trim();
    }
    catch (error) {
        logger.error(`Gemini question generation failed: ${error.message}`);
        logger.error(`Full error: ${JSON.stringify(error)}`);
        return null;
    }
}

module.exports = {
    generateQuestion
};