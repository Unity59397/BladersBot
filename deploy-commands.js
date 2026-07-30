require("dotenv").config();

const { REST, Routes } = require("discord.js");

const setchannel = require("./commands/setchannel");
const config = require("./commands/config");
const daily = require("./commands/daily");


const commands = [
    setchannel.data.toJSON(),
    config.data.toJSON(),
    daily.data.toJSON()
];


const rest = new REST({
    version: "10"
}).setToken(process.env.DISCORD_TOKEN);



async function deploy(){

    try {

        console.log("⏳ Registering slash commands...");


        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),

            {
                body: commands
            }
        );


        console.log("✅ Slash commands registered!");

    }

    catch(error){

        console.error(error);

    }

}


deploy();