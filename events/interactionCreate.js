const logger = require("../utils/logger");


module.exports = {

    name: "interactionCreate",


    async execute(interaction){


        if(!interaction.isChatInputCommand())
            return;


        const command =
        interaction.client.commands.get(
            interaction.commandName
        );


        if(!command)
            return;


        try {

            await command.execute(interaction);

        }

        catch(error){

            logger.error(error);


            if(interaction.replied){

                await interaction.followUp({

                    content:
                    "❌ Something went wrong.",

                    ephemeral:true

                });

            }

            else {

                await interaction.reply({

                    content:
                    "❌ Something went wrong.",

                    ephemeral:true

                });

            }

        }

    }

};