const Discord = require('discord.js')

// Todo: string localization?

class DiscordIntegrationPlugin {
    constructor(omegga, config) {
        this.omegga = omegga;
        this.config = config;
    }

    async init() {
        // log into discord
        this.discordClient = new Discord.Client();
        await this.discordClient.login(this.config.token);

        // TODO: resolve discord channels & other stuff here to avoid spaghet

        // register chat commands
        // !mod <report msg>
        this.omegga.on("chatcmd:mod", (name, ...args) => {
            this.discordClient.channels.fetch(this.config["mod-channel-id"]).then(channel => {
                channel.send(`${this.config["mod-tag-id"] ? `<@${this.config["mod-tag-id"]}> ` : ``}A report has been issued in-game from user ${name}: ${args.join(" ")}`).then(msg => { // todo: differentiate between user and role
                    this.omegga.whisper(name, `"Your report has been issued to the moderators: \\"${args.join(" ")}\\""`);
                });
            }).catch(msg => {
                this.omegga.broadcast(`Failed to issue report: ${msg}`);
            })
        });
        // todo: bind in-game users to discord users

        // todo: connect in-game and discord chats
        this.omegga.on("chat", (name, msg) => {
            this.discordClient.channels.fetch(this.config["chat-channel-id"]).then(channel => {
                let embed = new Discord.MessageEmbed().setAuthor(name).setDescription(msg);
                channel.send(embed);
            })
        });

        // Todo: allow moderators to execute commands from discord
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;