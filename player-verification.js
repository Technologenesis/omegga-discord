const ConfigRequirements = require("./config-requirements");

class PlayerVerifier {
    constructor(pluginCtx) {
        this.pluginCtx = pluginCtx;
        this.codeMap = {};
        this.setup_player_verification(pluginCtx.omegga, pluginCtx.discordClient, pluginCtx.config);
    }

    setup_player_verification(omegga, discordClient, config) {
        let missing_reqs = ConfigRequirements.check_requirements(config, ["verify-timeout"]);
        if(missing_reqs.length !== 0) {
            throw "The following configs are required for player verification, but were not found:\n" + missing_reqs.toString();
        }

        omegga.on("cmd:verify", (name) => {
            let code = generate_code();
            while (this.codeMap[code]) {
                code = generate_code();
            }
            this.codeMap[code] = name;
            setTimeout(() => {
                delete this.codeMap[code]
            }, config["verify-timeout"] * 60000);
            omegga.whisper(name, "To verify your in-game character, DM the following code to " + discordClient.user.username
                + " in the Discord server within the next " + config["verify-timeout"] + " minutes: " + code);
        });


        omegga.on("cmd:whois", (name, ...args) => {
            if(!args[0]) {
                omegga.whisper(name, "Usage: /whois <playername>");
            }

            let searchedName = args.join(" ");
            this.fetch_discord_id(searchedName)
                .then(id => discordClient.users.fetch(id))
                .then(user => omegga.whisper(name, searchedName + "is verified on discord as @" +user.username));
                .catch(reason => omegga.whisper(name, "Found no verified user by the name '" + searchedName + "' (" + reason + ")"));
        });

        discordClient.on("message", msg => {
            if (msg.channel.type === "dm" && msg.author.id !== discordClient.user.id) {
                let match = msg.content.toString().match(/\d{4}/);
                if (match) {
                    let code = match[0];
                    let name = this.codeMap[code];
                    if (name) {
                        msg.reply("Hi, " + name + "! Saving your verification status...");
                        this.set(msg.author.id, name).then(() => {
                            delete this.codeMap[code];
                            msg.reply("Thanks! Your character '" + name + "' has been verified!");
                        }).catch(reason => msg.reply("Error verifying character: " + reason));
                    } else {
                        msg.reply("I couldn't find that verification code! Use /verify in-game to get a verification code.");
                    }
                } else {
                    msg.reply("I couldn't find a verification code in your message. Use /verify in-game to get a verification code.");
                }
            }
        });
    }

    set(discord_id, brickadia_name) {
        return this.pluginCtx.store.get("verified-players").then(verified_players => {
            verified_players.discord_to_brickadia[discord_id] = brickadia_name;
            verified_players.brickadia_to_discord[brickadia_name] = discord_id;
            return this.pluginCtx.store.set("verified-players", verified_players);
        }).catch(_ => {
            let verified_players = {brickadia_to_discord: {}, discord_to_brickadia: {}};
            verified_players.discord_to_brickadia[discord_id] = brickadia_name;
            verified_players.brickadia_to_discord[brickadia_name] = discord_id;
            return this.pluginCtx.store.set("verified-players", verified_players);
        });
    }

    fetch_discord_id(brickadia_name) {
        return this.pluginCtx.store.get("verified-players")
            .then(
                verified_players => verified_players.brickadia_to_discord[brickadia_name]
            );
    }
}

function generate_code() {
    return getRandomInt(0, 10000).toString().padStart(4, "0");
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

module.exports = PlayerVerifier;
