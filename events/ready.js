const logger = require("../utils/logger");
const { startScheduler } = require("../services/scheduler");

module.exports = {
    name: "clientReady",
    once: true,

    execute(client) {
        console.log("READY EVENT FIRED");
        logger.info(`Logged in as ${client.user.tag}`);
        startScheduler(client);
    }
};
