Feature: Verify from Discord
    Users should be able to verify from within Discord

    Background:
        Given a Player verifier
        And a user ID
        And a player ID
    
    Scenario: A user tries to verify from Discord
        When a user uses /verify in Discord
        Then the Player Verifier returns a verification code
        And the verification code is mapped to the given user

    Scenario: A player sends a valid verification code in-game
        Given a valid verification code
        When a user sends the verification code in-game
        Then the user is mapped to the correct player
    
    Scenario: A player sends an invalid verification code in-game
        Given an invalid verification code
        When a user sends the verification code in-game
        Then the user is not mapped to any player

    Scenario: A player sends an expired verification code in-game
        Given a valid verification code
        When the verification code expires
        And the user sends the verification code in-game
        Then the user is not mapped to any player