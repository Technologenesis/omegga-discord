const ConfigRequirements = require('./config-requirements');

function setup_tracking_ingame_players(omegga, discordClient, config, player_verifier) {
    let missing_reqs = ConfigRequirements.check_requirements(config, ["enable-player-verification", "ingame-role", "guild-id"]);
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for tracking ingame players, but were not found:\n" + missing_reqs.toString();
    }

    // all of this relies on having the guild object
    discordClient.guilds.fetch(config["guild-id"])
        .catch(reason => {throw "failed to get guild: " + reason})
        .then(guild => {
            guild.roles.fetch(config["ingame-role"])
                .then(role => {

                    clear_online_players(role);
                    poll_online_players(omegga, role, player_verifier);
                    setInterval(() => {
                        poll_online_players(omegga, role, player_verifier);
                    }, 30000);

                    omegga.on("join", player => {
                        player_verifier.fetch_discord_id(player.name)
                            .then(id => role.guild.members.fetch(id))
                            .then(member => member.roles.add(role))
                            .catch(()=>{});
                    });

                    omegga.on("leave", player => {
                        player_verifier.fetch_discord_id(player.name)
                            .then(id => role.guild.members.fetch(id))
                            .then(member => member.roles.remove(role))
                            .catch(()=>{});
                    });

                })
                .catch(reason => {
                    throw "failed to set up role tracking: " + reason;
                });
        })
        .catch(reason => {
            throw reason;
        });
}

function clear_online_players(role) {
    role.guild.members.fetch().then(members => {
        for (let member of members.array()) {
            member.roles.remove(role.id).catch(reason => {
                throw "Failed to remove role: " + reason
            });
        }
    }).catch(reason => console.error("Failed to fetch members: " + reason));
}

function poll_online_players(omegga, role, player_verifier) {
    // add currently in-game players to role
    for (let player of omegga.getPlayers()) {
        player_verifier.fetch_discord_id(player.name)
            .then(id => role.guild.members.fetch(id))
            .then(member => member.roles.add(role))
            .catch(() => {}); //this probably just means the player isn't verified
    }
}

module.exports = setup_tracking_ingame_players;