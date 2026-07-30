require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const fs = require("fs");
const logger = require("./utils/logger");


const client = new Client({

    intents:[
        GatewayIntentBits.Guilds
    ]

});



client.commands = new Collection();



const commandFiles =
fs.readdirSync("./commands")
.filter(file =>
file.endsWith(".js")
);



for(const file of commandFiles){

const command =
require(`./commands/${file}`);


client.commands.set(
command.data.name,
command
);

}



client.once("ready",()=>{

    logger.info(
        `Logged in as ${client.user.tag}`
    );

});



client.on(
"interactionCreate",
async interaction=>{


if(!interaction.isChatInputCommand())
return;


const command =
client.commands.get(
interaction.commandName
);



if(!command)
return;



try{

await command.execute(interaction);

}

catch(error){

console.error(error);

await interaction.reply({

content:
"❌ Something went wrong.",

ephemeral:true

});

}


});



client.login(
process.env.DISCORD_TOKEN
);