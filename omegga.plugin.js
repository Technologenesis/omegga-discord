const Discord = require('discord.js')

// Todo: string localization?

//Store and validate configuration for easy access
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

    // map from chatcmds to associated function
    cmdFuncs = {
        //!mod <report message>
        "mod": (name, logref, ...args) => {
            let msg = args.join(" ");

            let embed = new Discord.MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Report")
                .setAuthor(name)

            if(logref) {
                embed.setDescription(`A [report](${logref.url}) has been issued: ${msg}`)
            } else {
                embed.setDescription(`A report has been issued: ${msg}`)
            }

            let discordMessage = new Discord.APIMessage(this.mod_channel,
                {content: this.config.mod_msg_prefix, embed: embed});

            this.mod_channel.send(discordMessage)
                .then(_ => // todo: differentiate between user and role
                    this.omegga.whisper(name, `"Your report has been issued to the moderators: \\"${msg}\\""`))
                .catch(msg =>
                    this.omegga.whisper(name, `Failed to issue report: ${msg}`)
                );
        }
    };

    // Todo: Add support for tagging in-game
    // helper function for interpreting chat commands
    InterpretChatCMD(name, msg, logref) {
        if(msg.startsWith("!")) {
            let cmd = msg.slice(1);
            // group command into words separated by spaces, OR any number of words grouped into quotes
            let args = cmd.match(/("[^"]+"\s*|'[^']+'\s*|[^\s"']+)/g);
            if(cmd) {
                let cmdFunc = this.cmdFuncs[args[0]];
                if(cmdFunc) {
                    cmdFunc(name, logref, ...args.slice(1));
                }
            }
        }
    }

    async init() {
        // log into discord
        this.discordClient = new Discord.Client();
        await this.discordClient.login(this.config.token);

        // Resolve channels to avoid fetching each time
        // todo: Does this need to be done serially?
        this.mod_channel = await this.discordClient.channels.fetch(this.config.mod_channel_id);
        this.chat_channel = this.config.chat_channel_id ?
            await this.discordClient.channels.fetch(this.config.chat_channel_id) :
            null;

        // todo: bind in-game users to discord users

        // todo: connect in-game and discord chats
        this.omegga.on("chat", (name, msg) => {
            if(this.chat_channel) {
                // If there's a chat log, send to the chat log first, THEN check for command command with reference to
                // chat log
                let embed = new Discord.MessageEmbed().setAuthor(name).setDescription(msg);
                this.chat_channel.send(embed).then(logref => this.InterpretChatCMD(name, msg, logref));
            } else {
                // Otherwise just check for command with no log message
                this.InterpretChatCMD(name, msg, null);
            }
        });

        // Todo: allow moderators to execute commands from discord
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;