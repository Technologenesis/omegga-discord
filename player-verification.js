const ConfigRequirements = require("./config-requirements");

function setup_player_verification(omegga, discordClient, config, store) {
    ConfigRequirements.check_requirements(config, ["verify-timeout"]);
    codeMap = {};

    omegga.on("cmd:verify", (name, ...args) => {
        let code = generate_code();
        while (codeMap[code]) {
            code = generate_code();
        }
        codeMap[code] = name;
        setTimeout(() => {
            delete codeMap[code]
        }, config["verify-timeout"] * 6000);
        omegga.whisper(name, "To verify your in-game character, DM the following code to " + discordClient.user.username
            + " in the Discord server within the next " + config["verify-timeout"] + " minutes: " + code);
    });


    omegga.on("cmd:whois", (name, ...args) => {
        if(!args[0]) {
            omegga.whisper(name, "Usage: /whois <playername>");
        }
        store.get("verified-players")
            .then(verified_players => {
                if(verified_players && get_discord_name(verified_players, args[0])) {
                    omegga.whisper(name, get_discord_name(verified_players, args[0]))
                } else {
                    omegga.whisper(name, "Could not find player " + args[0]);
                }
            })
            .catch(omegga.whisper("Could not fetch verified player store."));
    });

    discordClient.on("message", msg => {
        if (msg.channel.type === "dm" && msg.author.id !== discordClient.user.id) {
            let match = msg.content.toString().match(/\d{4}/);
            if (match) {
                let code = match[0];
                let name = codeMap[code];
                if (name) {
                    msg.reply("Hi, " + name + "! Saving your verification status...");
                    store.get("verified-players").then(verified_players =>
                        set(verified_players, store, msg.author.username, name)
                    ).catch(_ =>
                        set(new VerifiedPlayerMap(), store, msg.author.username, name)
                    ).finally(() => {
                        delete codeMap[code];
                        msg.reply("Thanks! Your character '" + name + "' has been verified!");
                    });
                } else {
                    msg.reply("I couldn't find that verification code! Use /verify in-game to get a verification code.");
                }
            } else {
                msg.reply("I couldn't find a verification code in your message. Use /verify in-game to get a verification code.");
            }
        }
    });
}

class VerifiedPlayerMap {
    constructor() {
        this.discord_to_brickadia = {};
        this.brickadia_to_discord = {};
    }
}

function set(player_map, store, discord_name, brickadia_name) {
    player_map.discord_to_brickadia[discord_name] = brickadia_name;
    player_map.brickadia_to_discord[brickadia_name] = discord_name;
    return store.set("verified-players", player_map);
}

function get_brickadia_name(player_map, discord_name) {
    return player_map.discord_to_brickadia[discord_name];
}

function get_discord_name(player_map, brickadia_name) {
    return player_map.brickadia_to_discord[brickadia_name];
}

function generate_code() {
    return getRandomInt(0, 10000).toString().padStart(4, "0");
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

module.exports = setup_player_verification;