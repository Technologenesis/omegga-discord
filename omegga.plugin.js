const Discord = require('discord.js')

// Todo: string localization?

//Store and validate configuration for easy access
class ConfigObject {
    constructor(configMap) {
        this.token = configMap["token"];
        if(!this.token) {
            throw "missing Discord token!"
        }

        this.guild_id = configMap["guild-id"];

        this.mod_channel_id = configMap["mod-channel-id"];

        this.chat_channel_id = configMap["chat-channel-id"];
        this.enable_godspeak_for_mods = configMap["enable-godspeak-for-mods"];
        this.enable_godspeak_for_users = configMap["enable-godspeak-for-users"];
        this.enable_chat_logs = configMap["enable-chat-logs"];
        if((this.enable_godspeak_for_users || this.enable_godspeak_for_mods || this.enable_chat_logs)
            && !this.chat_channel_id) {
            throw "chat-channel-id is required if enable-godspeak-for-users is true";
        }

        if(!this.mod_channel_id && !this.chat_channel_id) {
            throw "config is missing both mod-channel-id and chat-channel-id; one must be present";
        }

        this.log_channel_id = configMap["log-channel-id"];
        this.enable_console_logs = configMap["enable-console-logs"];
        this.enable_remote_commands = configMap["enable-remote-commands"];
        if (this.enable_remote_commands && !this.log_channel_id) {
            throw "config log-channel-id must be present if enable-remote-commands is true";
        }
        if (this.enable_console_logs && !this.log_channel_id) {
            throw "config log-channel-id must be present if enable-console-logs is true";
        }
        if (this.log_channel_id == this.mod_channel_id) {
            throw "log-channel-id must be different from mod-channel-id";
        }
        if (this.log_channel_id == this.chat_channel_id) {
            throw "log-channel-id must be different from chat-channel-id";
        }

        this.mod_tag_id = configMap["mod-tag-id"]
        if(this.enable_remote_commands && !this.mod_tag_id) {
            throw "mod-tag-id is required if enable-remote-commands is true";
        }
        if(this.enable_godspeak_for_mods && !this.mod_tag_id) {
            throw "mod-tag-id is required if enable-godspeak-for-mods is true";
        }

        this.mod_msg_prefix = configMap["mod-tag-id"] ? `<@&${configMap["mod-tag-id"]}> ` : ``;
    }
}

class DiscordIntegrationPlugin {
    constructor(omegga, config) {
        this.omegga = omegga;
        console.log("Validating Omegga-Discord config...")
        this.config = new ConfigObject(config);
    }

    async init() {
        // log into discord
        this.discordClient = new Discord.Client();
        console.log("Logging in to discord...");
        await this.discordClient.login(this.config.token);
        console.log("Logged in as " + this.discordClient.user.username);

        // Resolve channels to avoid fetching each time
        // todo: Does this need to be done serially?
        this.guild = await this.discordClient.guilds.fetch(this.config.guild_id);
        this.mod_role = await this.guild.roles.fetch(this.config.mod_tag_id);
        this.chat_channel = this.config.chat_channel_id ?
            await this.discordClient.channels.fetch(this.config.chat_channel_id) :
            null;
        this.mod_channel = this.config.mod_channel_id ?
            await this.discordClient.channels.fetch(this.config.mod_channel_id) :
            chat_channel;
        this.log_channel = this.config.log_channel_id ?
            await this.discordClient.channels.fetch(this.config.log_channel_id) :
            null;

        console.log("Server: " + this.guild.name);
        console.log("Mod Channel: " + this.mod_channel.name + (this.mod_role ? " (mod role: @" + this.mod_role.name + ")" : ""));
        if(!this.mod_channel.isText()) {
            throw "mod channel must be a text channel"
        }
        console.log("Chat Channel: " + this.chat_channel.name);
        if(!this.chat_channel.isText()) {
            throw "chat channel must be a text channel"
        }
        console.log("Log Channel: " + this.log_channel.name);
        if(!this.log_channel.isText()) {
            throw "log channel must be a text channel"
        }


        // todo: bind in-game users to discord users

        // commands
        this.omegga.on("cmd:report", (name, ...args) => {
            let msg = args.join(" ");

            let embed = new Discord.MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Report")
                .setAuthor(name);

            if(this.config.enable_chat_logs) {
                let logref = this.chat_channel.messages.fetch({limit:1}).then(logref => {
                        embed.setDescription(`A report has been issued: ${msg}\n\n[View chat log at time of report](${logref.url})`);

                        let discordMessage = new Discord.APIMessage(this.mod_channel,
                            {content: this.config.mod_msg_prefix, embed: embed});

                        this.mod_channel.send(discordMessage)
                            .then(_ => // todo: differentiate between user and role
                                this.omegga.whisper(name, `"Your report has been issued to the moderators: \\"${msg}\\""`))
                            .catch(msg =>
                                this.omegga.whisper(name, `Failed to issue report: ${msg}`)
                            );
                    }
                );
            } else {
                embed.setDescription(`A report has been issued: ${msg}`);

                let discordMessage = new Discord.APIMessage(this.mod_channel,
                    {content: this.config.mod_msg_prefix, embed: embed});

                this.mod_channel.send(discordMessage)
                    .then(_ => // todo: differentiate between user and role
                        this.omegga.whisper(name, `"Your report has been issued to the moderators: \\"${msg}\\""`))
                    .catch(msg =>
                        this.omegga.whisper(name, `Failed to issue report: ${msg}`)
                    );
            }
        })

        // chat log
        if(this.config.enable_chat_logs) {
            this.omegga.on("chat", (name, msg) => {
                // If there's a chat log, send to the chat log first, THEN check for command command with reference to
                // chat log
                let embed = new Discord.MessageEmbed().setAuthor(name).setDescription(msg);
                this.chat_channel.send(embed);//.then(logref => this.InterpretChatCMD(name, msg, logref));
            });
        }

        // stream console logs
        if(this.config.enable_console_logs) {
            this.omegga.on("line", logline => this.log_channel.send(logline));
        }

        // deal with discord messages in relevant channels
        // don't bother setting up the callback if we don't need to
        if(this.config.enable_godspeak_for_users || this.config.enable_godspeak_for_mods
            || this.config.enable_remote_commands) {
            this.discordClient.on("message", msg => {

                //mod godspeak
                if(msg.channel == this.chat_channel && this.config.enable_godspeak_for_mods
                    && this.mod_role.members.has(msg.member.id)
                    && msg.author.id != this.discordClient.user.id) {
                    this.omegga.broadcast(`<b><color=\"#ff0000\">${
                        msg.author.username
                    } [mod]</color><color=\"#7289da\"> [discord]</color></b><color=\"ffffff\">: ${
                        msg.content
                    }</color>`);
                }

                //user godspeak
                else if(msg.channel == this.chat_channel && this.config.enable_godspeak_for_users
                    && msg.author.id != this.discordClient.user.id) {
                    this.omegga.broadcast(`<b><color=\"#ffff00\">${
                        msg.author.username
                    }</color><color=\"#7289da\"> [discord]</color></b><color=\"ffffff\">: ${
                        msg.content
                    }</color>`);
                }

                // remote commands
                else if (msg.channel == this.log_channel && this.config.enable_remote_commands
                    && msg.author.id != this.discordClient.user.id && this.mod_role.members.has(msg.user.id)) {
                    this.omegga.writeln(msg.content);
                }

            });
        }
        // Todo: allow moderators to execute commands from discord
        console.log("Init complete.");
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;