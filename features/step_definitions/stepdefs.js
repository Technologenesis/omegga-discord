const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const PlayerVerifier = require('../../player-verification');

Given('a Player verifier', function () {
    // Create a player verifier to object
    this.player_verifier_store = {}
    this.code_manager = {}
    this.player_verifier = new PlayerVerifier(store=this.player_verifier_store, discord_code_manager=this.code_manager);
});

Given('a user ID', function () {
    // Create a mock user ID
    this.user = "discorduser"
});

Given('a player ID', function () {
    // Create a mock player ID
    this.player = "brickadiaplayer"
});

Given('a valid verification code', function () {
    // create a valid verification code
    this.verification_code = "0000";
    this.code_manager[this.verification_code] = this.player;
});

Given('an invalid verification code', function () {
    // create an invalid verification code
    this.verification_code = "0000";
});

When('a user uses \\/verify in Discord', function () {
    // create a valid verification code
    this.verification_code = this.player_verifier.generate_code_for_discord_user();
});

When('a user sends the verification code in-game', function () {
    // attempt to verify the code
    this.verification_result = this.player_verifier.verify_discord_user(this.verification_code, this.player);
});

When('the verification code expires', function () {
    delete this.code_manager[this.verification_code];
})

Then('the Player Verifier returns a verification code', function () {
    // ensure that a code was generated
    assert(this.verification_code);
});

Then('the user is mapped to the correct player', function () {
    // ensure that this.user is mapped to this.player in the store
    assert.strictEqual(this.store[this.user], this.player);
});

Then('the user is not mapped to any player', function () {
    // ensure that this.user is not mapped to any player in the store
    assert(!this.store[this.user]);
});

Then('the verification code is mapped to the given user', function () {
    // ensure that this.code_manager has mapped the verification code to the user
    assert.strictEqual(this.user, this.code_manager[this.verification_code]);
})