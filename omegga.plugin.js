const Discord = require('discord.js')

// Todo: string localization?

class ConfigObject {
    constructor(configMap) {
        this.mod_channel_id = configMap["mod-channel-id"] || configMap["chat-channel-id"];
        if(!this.mod_channel_id) {
            throw "config is missing both mod-channel-id and chat-channel-id; one must be present";
        }
        this.chat_channel_id = configMap["chat-channel-id"];

        this.mod_msg_prefix = configMap["mod-tag-id"] ? `<@${configMap["mod-tag-id"]}> ` : ``;

        this.token = configMap["token"];
        if(!this.token) {
            throw "missing Discord token!"
        }
    }
}

class DiscordIntegrationPlugin {
    constructor(omegga, config) {
        this.omegga = omegga;
        this.config = new ConfigObject(config);
    }

    async init() {
        // log into discord
        this.discordClient = new Discord.Client();
        await this.discordClient.login(this.config.token);

        // Resolve channels to avoid fetching each time
        // todo: Does this need to be done serially?
        let mod_channel = await this.discordClient.channels.fetch(this.config.mod_channel_id);
        let chat_channel = this.config.chat_channel_id ?
            await this.discordClient.channels.fetch(this.config.chat_channel_id) :
            null;

        // register chat commands
        // !mod <report msg>
        this.omegga.on("chatcmd:mod", (name, ...args) => {
            let msg = args.join(" ")
            mod_channel.send(`${this.config.mod_msg_prefix}A report has been issued in-game from user ${name}: ${msg}`)
                .then(_ => // todo: differentiate between user and role
                    this.omegga.whisper(name, `"Your report has been issued to the moderators: \\"${msg}\\""`))
                .catch(msg =>
                    this.omegga.broadcast(`Failed to issue report: ${msg}`)
                );
            })
        // todo: bind in-game users to discord users

        // todo: connect in-game and discord chats
        this.omegga.on("chat", (name, msg) => {
            if(chat_channel) {
                let embed = new Discord.MessageEmbed().setAuthor(name).setDescription(msg);
                chat_channel.send(embed);
            }
        });

        // Todo: allow moderators to execute commands from discord
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;