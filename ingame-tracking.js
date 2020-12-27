const ConfigRequirements = require('./config-requirements');
PlayerVerification = require('/player-verification');

function setup_tracking_ingame_players(omegga, discordClient, config, store) {
    let missing_reqs = ConfigRequirements.check_requirements(config, ["enable-player-verification", "ingame-role"]);
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for tracking ingame players, but were not found:\n" + missing_reqs.toString();
    }

    discordClient.roles.fetch(config["ingame-role"])
        .then(ingame_role => {
            initialize_role(omegga, discordClient, ingame_role);

            omegga.on("join", (name) => {
                store.get("verified-players")
                    .then(verified_players => {
                        discord_id =
                    })
            })
        })
        .catch(reason => {throw "Could not fetch ingame-role: " + reason});
}

module.exports = setup_tracking_ingame_players;