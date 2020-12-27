const ConfigRequirements = require("./config-requirements");

function log_console(omegga, discordClient, config) {
    let missing_reqs = ConfigRequirements.check_requirements(config, ["log-channel-id"]);
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for console logging, but were not found:\n" + missing_reqs.toString();
    }

    discordClient.channels.fetch(config["log-channel-id"]).then(log_channel =>
        omegga.on("line", logline => {
            log_channel.send(logline);
        })
    ).catch(reason => {throw "failed to get log channel: " + reason});
}

module.exports = log_console;