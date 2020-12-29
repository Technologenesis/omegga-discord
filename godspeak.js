const ConfigRequirements = require("./config-requirements");

function setup_godspeak(omegga, discordClient, config) {
    let missing_reqs = ConfigRequirements.check_requirements(config,
        ["chat-channel-id"]
    );
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for godspeak, but were not found:\n" + missing_reqs.toString();
    }

    discordClient.channels.fetch(config["chat-channel-id"]).then(chat_channel => {
        if(config["enable-godspeak-for-mods"]) {
            chat_channel.guild.roles.fetch(config["mod-tag-id"])
                .then(mod_role => set_godspeak_listener(omegga, discordClient, chat_channel, config, mod_role))
                .catch(reason => {throw "Unable to get mod role: " + reason});
        } else {
            set_godspeak_listener(omegga, discordClient, chat_channel, config);
        }
    }).catch(reason => {throw "Unable to get chat channel: " + reason});
}

function set_godspeak_listener(omegga, discordClient, chat_channel, config, mod_role) {
    discordClient.on("message", msg => {
        if (msg.channel === chat_channel && msg.author.id !== discordClient.user.id)
        {
            if(mod_role && mod_role.members.has(msg.member.id)) {
                let msgPrefix = "<b><color=\"#ff0000\">" + msg.member.nickname +
                    " [mod]</color><color=\"#7289da\"> [discord]</color></b>";
                omegga.broadcast(msgPrefix+"<color=\"ffffff\">: " + msg.content + "</color>");
            } else if(config["enable-godspeak-for-users"]) {
                let msgPrefix = "<b><color=\"#ffff00\">" + msg.author.nickname +
                    "</color><color=\"#7289da\"> [discord]</color></b>";
                omegga.broadcast(msgPrefix+"<color=\"ffffff\">: " + msg.content + "</color>");
            }
        }
    });
}

module.exports = setup_godspeak;