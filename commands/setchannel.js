const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");


const {
    updateSettings
} = require("../services/database");



module.exports = {

    data: new SlashCommandBuilder()

        .setName("setchannel")

        .setDescription(
            "Set the channel where QOTD will be posted"
        )

        .addChannelOption(option =>
            option

            .setName("channel")

            .setDescription(
                "The QOTD channel"
            )

            .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),



    async execute(interaction){


        const channel =
            interaction.options.getChannel("channel");


        updateSettings(
            interaction.guild.id,
            "channel_id",
            channel.id
        );


        await interaction.reply({

            content:
            `✅ QOTD channel set to ${channel}`,

            ephemeral:true

        });


    }

};