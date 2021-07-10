Feature: Verify from Discord
    Users should be able to verify from within Discord

    Background:
        Given an Omegga instance
        And a Discord instance
        And Discord verification
        And a Discord user

    Scenario: A player tries to verify from Discord
        When a user uses /verify in Discord
        Then the user should receive a verification code in Discord PMs

    Scenario: A player sends a valid verification code in-game
        Given a valid verification code
        When a user sends the verification code in-game
        Then the user is added to the verified list
        And the user is shown a message that their verification succeeded
    
    Scenario: A player sends an invalid verification code in-game
        Given an invalid verification code
        When a user sends the verification code in-game
        Then the user is not added to the verified list
        And the user is shown a message that their code was invalid

    Scenario: A player sends an expired verification code in-game
        Given a valid verification code
        When the verification code expires
        And the user sends the verification code in-game
        Then the user is not added to the verified list
        And the user is shown a message that their code was invalid