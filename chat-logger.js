const Discord = require("discord.js");
const ConfigRequirements = require("./config-requirements");

function log_chats(omegga, discordClient, config) {
    // make sure all required config items are present
    let missing_reqs = ConfigRequirements.check_requirements(config, ["chat-channel-id"]);
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for chat logging, but were not found:\n" + missing_reqs.toString();
    }

    discordClient.channels.fetch(config["chat-channel-id"]).then(chat_channel => {
        omegga.on("chat", (name, msg) => {
            let embed = new Discord.MessageEmbed().setAuthor(name).setDescription(msg);
            chat_channel.send(embed);
        });

        /*
        omegga.on("line", logline => {
            let logChat = logline.match(/\[\d+\.\d+\.\d+-\d+\.\d+\.\d+:\d+\]\[[\s\d]+\]LogChat: (.*)/);
            if (logChat) {
                chat_channel.send(logChat[1]);
            }
        });
         */
    }).catch(reason => {throw "failed to get chat channel: " + reason.toString()});
}

module.exports = log_chats;