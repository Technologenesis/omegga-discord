const Discord = require('discord.js')
const log_chats = require('./chat-logger');
const log_reports = require('./report-logger');
const log_console = require('./console-logger');
const setup_godspeak = require('./godspeak');
const setup_player_verification = require('./player-verification');
const setup_tracking_ingame_players = require('./ingame-tracking');

// Todo: string localization?

class DiscordIntegrationPlugin {
    constructor(omegga, config, store) {
        this.omegga = omegga;
        this.config = config;
        this.store = store;
    }

    async init() {
        // log into discord
        this.discordClient = new Discord.Client();
        console.log("Logging in to discord...");
        await this.discordClient.login(this.config.token);
        console.log("Logged in as " + this.discordClient.user.username);

        // todo: bind in-game users to discord users

        // report log
        if(this.config["mod-channel-id"]) {
            log_reports(this.omegga, this.discordClient, this.config);
            console.log("Set up report log");
        }

        // chat log
        if(this.config["enable-chat-logs"]) {
            log_chats(this.omegga, this.discordClient, this.config);
            console.log("Set up chat log");
        }

        // stream console logs
        if(this.config["enable-console-logs"]) {
            log_console(this.omegga, this.discordClient, this.config);
            console.log("Set up console logger");
        }

        // godspeak
        if(this.config["enable-godspeak-for-users"] || this.config["enable-godspeak-for-mods"]) {
            setup_godspeak(this.omegga, this.discordClient, this.config);
            console.log("Set up godspeak");
        }

        // player verification
        if(this.config["enable-player-verification"]) {
            setup_player_verification(this.omegga, this.discordClient, this.config, this.store);
            console.log("Set up player verification");
        }

        // track in-game players
        if(this.config["enable-tracking-ingame-players"]) {
            setup_tracking_ingame_players(this.omegga, this.discordClient, this.config, this.store);
        }

        // TODO: discord mod commands
        // WIP

        console.log("Init complete.");
    }

    async stop() {}
}

module.exports = DiscordIntegrationPlugin;