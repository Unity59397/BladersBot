require("dotenv").config();

const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");
const logger = require("./utils/logger");
const loadCommands = require("./utils/commandLoader");
const loadEvents = require("./utils/eventLoader");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

function startHealthServer() {
    const port = Number(process.env.PORT || 3000);

    const server = http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Bladers QOTD bot is running\n");
    });

    server.listen(port, () => {
        logger.info(`Health server listening on port ${port}`);
    });
}

process.on("uncaughtException", (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
});

process.on("unhandledRejection", (error) => {
    logger.error(`Unhandled rejection: ${error.message}`);
});

startHealthServer();
loadCommands(client);
loadEvents(client);

if (!process.env.DISCORD_TOKEN) {
    logger.error("DISCORD_TOKEN is missing. Set it in your environment or .env file.");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
