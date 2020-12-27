const ConfigRequirements = require('./config-requirements');

function setup_mod_commands(omegga, discordClient, config) {
    let missing_reqs = ConfigRequirements.check_requirements(config,
        ["mod-tag-id", "cmd-channel-id"]
    );
    if (missing_reqs.length !== 0) {
        throw "The following configs are required for mod commands, but were not found:\n" + missing_reqs.toString();
    }

    discordClient.on("message", msg => {
        msg.channel.guild.roles.fetch(config["mod-tag-id"]).then(mod_role => {
            if (msg.channel.id === config["cmd-channel-id"] && mod_role.members.has(msg.member.id)//msg.member.roles.has(config["mod-tag-id"])
                && msg.author.id !== discordClient.user.id) {
                let args = msg.content.match(/(\S*)/g);
                switch (args[0]) {
                    case "clearAllBricks":
                        omegga.clearAllBricks(...args.slice(1));
                        break;
                    case "clearBricks":
                        omegga.clearBricks(...args.slice(1));
                        break;
                    case "getSaves":
                        msg.channel.send(omegga.getSaves(...args.slice(1)).toString());
                    case "loadBricks":
                        omegga.loadBricks(...args.slice(1));
                        break;
                    default:
                        msg.channel.send("Invalid command: " + args[0]);
                }
            }
        }).catch(reason => {throw "Unable to fetch mod role: ", reason});
    });
}

module.exports = setup_mod_commands;