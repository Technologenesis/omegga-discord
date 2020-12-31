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
            if(mod_role && mod_role.members && mod_role.members.has(msg.member.id)) {
                send_godspeak(omegga, true, msg);
            } else if(config["enable-godspeak-for-users"]) {
                send_godspeak(omegga, false, msg);
            }
        }
    });
}

function send_godspeak(omegga, mod, msg) {
    let msgPrefix = "<b><color=\"#ffff00\">" + (msg.member.nickname || msg.author.username) +
        "</color><color=\"#7289da\"> [discord]</color></b>";
    if(mod) {
        msgPrefix = "<b><color=\"#ff0000\">" + (msg.member.nickname || msg.author.username) +
            " [mod]</color><color=\"#7289da\"> [discord]</color></b>";
    }
    omegga.broadcast(msgPrefix+"<color=\"ffffff\">: " + parseLinks(sanitize(msg.content)) + "</color>");
}

// These exist in OMEGGA_UTIL... but for some reason I can't access that from here
// ugh. i hate doing this.
const sanitize = str => str
    // .replace(/&/g, '&')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '&scl;')
    .replace(/>/g, '&gt;')
    .replace(/_/g, '&und;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '\\"')
    .replace(/:\w+:/g, s => {
        const emote = s.slice(1, -1);
        if (EMOTES.includes(emote))
            return `<emoji>${emote}</>`;
        return s;
    });
const parseLinks = message => {
    const regex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
    return message.replace(regex, '<link="$1">$1</>');
};

module.exports = setup_godspeak;