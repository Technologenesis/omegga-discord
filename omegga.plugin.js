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

    cmdFuncs = {
        "mod": (name, ...args) => {
            let msg = args.join(" ");
            this.mod_channel.send(`${this.config.mod_msg_prefix}A report has been issued in-game from user ${name}: ${msg}`)
                .then(_ => // todo: differentiate between user and role
                    this.omegga.whisper(name, `"Your report has been issued to the moderators: \\"${msg}\\""`))
                .catch(msg =>
                    this.omegga.whisper(name, `Failed to issue report: ${msg}`)
                );
        }
    };

    InterpretChatCMD(name, msg) {
        if(msg.startsWith("!")) {
            let cmd = msg.slice(1);
            let args = cmd.match(/("[^"]+"\s*|'[^']+'\s*|[^\s"']+)/g);
            this.omegga.whisper(name, `${args}`);
            if(cmd) {
                let cmdFunc = this.cmdFuncs[args[0]];
                if(cmdFunc) {
                    cmdFunc(name, ...args.slice(1));
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
                let embed = new Discord.MessageEmbed().setAuthor(name).setDescription(msg);
                this.chat_channel.send(embed);
            }
            // check for command in chat message
            this.InterpretChatCMD(name, msg);
        });

        // Todo: allow moderators to execute commands from discord
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;