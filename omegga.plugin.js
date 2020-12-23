const Discord = require('discord.js')

class DiscordIntegrationPlugin {
    constructor(omegga, config) {
        this.omegga = omegga;
        this.config = config;
    }

    async init() {
        // log into discord
        this.discordClient = new Discord.Client();
        await this.discordClient.login(this.config.token);

        // register chat commands

        // !mod <report msg>
        this.omegga.on("chatcmd:mod", (name, ...args) => {
            this.discordClient.channels.fetch(this.config["channel-id"]).then(channel => {
                channel.send(`${this.config["mod-id"] ? `<@${this.config["mod-id"]}> ` : ``}A report has been issued in-game from user ${name}: ${args.join(" ")}`);
                this.omegga.broadcast(`A report has been issued to the moderators: ${args.join(" ")}`);
            }).catch(msg => {
                this.omegga.broadcast(`Failed to issue report: ${msg}`);
            })
        });
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;