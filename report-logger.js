const Discord = require("discord.js");
const ConfigRequirements = require("./config-requirements");


function log_reports(omegga, discordClient, config) {
    // make sure all required config items are present
    let missing_reqs = ConfigRequirements.check_requirements(config, ["mod-channel-id"]);
    if(missing_reqs.length !== 0) {
        throw "The following configs are required for mod commands, but were not found:\n" + missing_reqs.toString();
    }

    let mod_channel_promise = discordClient.channels.fetch(config["mod-channel-id"]);

    mod_channel_promise.then( mod_channel => {
        if(config["enable-chat-logs"]) {
            discordClient.channels.fetch(config["chat-channel-id"])
                .then(chat_channel => setup_report_log(omegga, mod_channel, config, chat_channel))
                .catch(_ => setup_report_log(omegga, mod_channel, config));
        } else {
            setup_report_log(omegga, mod_channel, config);
        }
    }).catch(reason => {throw "failed to get report channel: " + reason});
}

function setup_report_log(omegga, mod_channel, config, chat_channel) {
    omegga.on("cmd:report", (name, ...args) => {
        let msg = args.join(" ");

        if(chat_channel) {
            chat_channel.messages.fetch({limit: 1})
                .then(logref => send_report(omegga, mod_channel, name, msg, config["mod-tag-id"], logref.array()[0].url))
                .catch(_ => send_report(omegga, mod_channel, name, msg, config["mod-tag-id"]));
        } else {
            send_report(omegga, mod_channel, name, msg, config["mod-tag-id"]);
        }
    });
}

function send_report(omegga, channel, name, msg, mod_tag_id, log_url) {
    let embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Report")
        .setAuthor(name);

    if(log_url) {
        console.log("Report issued for " + log_url);
        embed.setDescription(`A report has been issued: ${msg}\n\n[View chat log at time of report](${log_url})`);
    } else {
        embed.setDescription(`A report has been issued: ${msg}`);
    }

    let discordMessage = new Discord.APIMessage(channel,
        {content: mod_tag_id ? `<@&${mod_tag_id}>` : ``, embed: embed});

    channel.send(discordMessage)
        .then(_ =>
            omegga.whisper(name, `"Your report has been issued to the moderators: \\"${msg}\\""`))
        .catch(err => omegga.whisper(name, `Failed to issue report: ${err}`));
}

module.exports = log_reports;