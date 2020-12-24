# Omegga-Discord

`Omegga-Discord` is an [Omegga](https://github.com/brickadia-community/omegga) plugin
allowing integration between a discord server and a Brickadia server.  It enables
moderators to moderate their Brickadia server remotely, and can be configured to enable
in-game players and Discord members to interact through chat features.

## Contents

- [Installation](#installation)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Planned Features](#planned-features)

## Installation

Clone this repository into the `plugins` subdirectory of wherever you run Omegga from. Then from the cloned directory,
install the plugin dependencies:
```
cd <Omegga-dir>/plugins
git clone https://github.com/Technologenesis/omegga-discord.git
cd omegga-discord
npm i
```

## Setup

You will need to create your own Discord bot, give it the appropriate permissions in your server, and supply its
authorization token when configuring this plugin.  A detailed guide to setting up a Discord bot can be found
[here](https://discordpy.readthedocs.io/en/latest/discord.html).

The particular permissions your bot needs will depend on how you configure the plugin.  The default configuration will
require the following permissions:

- View Channels
- Send Messages

If you plan to modify a particular configuration option, you can see below what extra permissions your bot will need.

## Configuration

All configuration is handled through the Omegga web interface.

**Config Options**

| Name  | Description | Default | Required | Permissions |
|-------|-------------|---------|----------|-------------|
| token | The authorization token for your bot account | None | **Yes**
| mod-channel-id | The ID[*](#discordids) of the channel or user for your bot to post mod-only messages to | None; if missing, mod-only messages will be posted to `chat-channel-id` | **Required** if `chat-channel-id` is not supplied. | Ensure that your bot is permitted to send messages in the given channel
| mod-tag-id | The ID[*](#discordids) of the user or role to @mention when posting mod-only messages | None | | If supplied, the bot will need permission to mention the given role or user
| chat-channel-id | The ID[*](discordids) of the user or channel in which to log in-game chat | None; if missing, in-game chat will not be logged | **Required** if `mod-channel-id` is not supplied | Ensure that your bot is permitted to send messages in the given channel
| enable-godspeak-for-mods | If enabled, messages posted to `mod-channel-id` from Discord will be relayed to the in-game chat | true | | Ensure that your bot is permitted to read messages in `mod-channel-id`
| enable-godspeak-for-users | If enabled, messages posted to `chat-channel-id` from Discord will be relayed to the in-game chat | false | | Ensure that your bot is permitted to read messages in `chat-channel-id`
| enable-remote-commands | If enabled, commands can be issued to `mod-channel-id` from Discord | false | | Ensure that your bot is permitted to read messages in `mod-channel-id`; **BE CERTAIN only those with the desired roles can post to `mod-channel-id`** (To-Do: check issued commands against in-game roles)

<sup><a name="discordids">*</a>: To obtain the ID of a resource in discord, right-click on it in the interface and click "Copy ID". When supplying the ID for a *role* instead of a *user* for the `-tag` options, prepend an ampersand (`&`) at the start of the ID.</sup>

## Usage

### Reporting

Players can report incidents in-game even when mods are absent using the `!mod` chat command, followed by a report
message. The report will be logged in `mod-channel-id` (or `chat-channel-id` if absent), and `mod-tag-id` will be
tagged. If a chat log is being maintained on the server, the report will also contain a link to the relevant message in
the chat log (NOT IMPLEMENTED).

## Planned features

The following features are planned for this project. Anyone should feel free to contribute and submit a pull request.

---

[ ] **Reporting**

[x] Allow players to issue in-game reports

[x] tag mods in reports

[x] post reports in chat log if no mod-channel-id present

[x] link to relevant chat log

[ ] Enable using a user ID for `mod-channel-id`

---

[ ] **Chat mirroring**

[x] Maintain chat log in `chat-channel-id`, if present

[ ] If `godspeak` is enabled, relay discord messages

[ ] Allow Discord users to verify their in-game characters

[ ] Allow players to opt in or out of seeing Discord messages in-game, with default provided in config.

[ ] Show in-game players as separate role

[ ] Allow mentioning discord users from in-game chat

---

[ ] **Remote moderation**

[ ] Allow users with access to `mod-channel-id` to execute server commands from discord.

[ ] Role integration; allow modifying in-game roles from Discord, and vice-versa

[ ] Build in safeguards to check issued commands against in-game roles

---

[ ] **Make Everything Configurable!!**

[ ] Configurable content of bot messages

[ ] Configurable embed colors

*As more features are implemented, keep track of what can be made configurable here*