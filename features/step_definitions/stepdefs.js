const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const PlayerVerifier = require('../../player-verification');
const Discord = require("./mock-discord");
const omegga = require("./mock-omegga");

Given('an Omegga instance', function () {
    // Create a mock Omegga instance
    this.omegga = new MockOmegga();
});

Given('a Discord instance', function () {
    // Create a mock Discord instance
    this.discord = new Discord.Client();
})

Given('Discord verification', function () {
    // Set up Discord verification on the mock instances
    this.player_verifier = new PlayerVerifier(this);
});

Given('a Discord user', function () {
    // Create a mock user in the mock discord server
    this.user = new Discord.User();
});

Given('a valid verification code', function () {
    // create a valid verification code
    this.verification_code = this.player_verifier.generate_code();
})

When('A player uses /verify in Discord', function () {
    // Cause the mock Discord instance to register a /verify message
    this.discord.triggerEvent("message", new Discord.Message(this.discord, this.channel, this.user));
});

When('When a user sends the verification code in-game', function () {
    // Cause the mock Omegga instance to register a verification code
    this.omegga.triggerEvent("cmd:verify", ["fred", this.verification_code]);
})

Then('the user should receive a verification code in Discord PMs', function () {
    // Check that the discord client has sent the user a message containing a 4-number code
    assert.strictEqual(this.user.dmChannel.lastMessage.author, this.discord.user);
    assert(this.user.dmChannel.lastMessage.content.match(/\d{4}/))
});