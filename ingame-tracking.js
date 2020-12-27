const ConfigRequirements = require('./config-requirements');

function setup_tracking_ingame_players(omegga, discordClient, config, store) {
    let missing_reqs = ConfigRequirements.check_requirements(config, ["enable-player-verification", "ingame-role"]);
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for tracking ingame players, but were not found:\n" + missing_reqs.toString();
    }

    discordClient.roles.fetch(config["ingame-role"])
}

module.exports = setup_tracking_ingame_players;