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
        
        const systemPrompt = `You are a Discord question generator. Generate EXACTLY two questions separated by a newline. Do NOT include any preamble, explanation, or extra text. Only output the questions in this format:
1. [General question]
2. [Beyblade question]`;

        const userPrompts = [
            "Generate two questions about hobbies and Beyblade toys.",
            "Generate two questions about travel and Beyblade characters.",
            "Generate two questions about food and Beyblade battles.",
            "Generate two questions about technology and Beyblade strategy.",
            "Generate two questions about music and Beyblade favorites.",
            "Generate two questions about games and Beyblade lore.",
            "Generate two questions about dreams and Beyblade tournaments.",
            "Generate two questions about relationships and Beyblade Bladers."
        ];
        
        const randomPrompt = userPrompts[Math.floor(Math.random() * userPrompts.length)];
        
        logger.info(`Calling Gemini API with prompt: "${randomPrompt}"`);
        
        const result = await model.generateContent([
            { text: systemPrompt },
            { text: randomPrompt }
        ]);

        const text = result.response.text().trim();
        logger.info(`Raw Gemini response: "${text}"`);
        
        if (!text || text.length === 0) {
            logger.warn("Gemini returned empty response");
            return null;
        }

        // Clean up the response - remove any preamble
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const cleanedText = lines
            .filter(line => line.match(/^[1-2]\./)) // Only keep lines starting with "1." or "2."
            .join('\n');

        if (!cleanedText) {
            logger.error(`Could not extract questions from: ${text}`);
            return null;
        }

        logger.info(`Cleaned questions: ${cleanedText}`);
        return cleanedText;
    }
    catch (error) {
        logger.error(`Gemini question generation failed: ${error.message}`);
        return null;
    }
}

module.exports = {
    generateQuestion
};