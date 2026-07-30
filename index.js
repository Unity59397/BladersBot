require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const logger = require("./utils/logger");
const loadCommands = require("./utils/commandLoader");
const loadEvents = require("./utils/eventLoader");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

process.on("uncaughtException", (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
});

process.on("unhandledRejection", (error) => {
    logger.error(`Unhandled rejection: ${error.message}`);
});

loadCommands(client);
loadEvents(client);

if (!process.env.DISCORD_TOKEN) {
    logger.error("DISCORD_TOKEN is missing. Set it in your environment or .env file.");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
