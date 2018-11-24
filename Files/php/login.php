<?

/*
 * File: login.php
 * Author(s): Matthew Dobson
 * Date modified: 11-23-2018
 * Description: Constitutes an endpoint for logging-in a user; receives POST
 * elements "username" and "password"; returns a JSON object with element
 * "isLogonSuccessful" set to true or false.
 */

include('AuthenticationConnection.php');

// JSON replies for successful and unsuccessful logons.
define('LOGON_SUCCESSFUL_JSON', '{"isLogonSuccessful":true}');
define('LOGON_UNSUCCESSFUL_JSON', '{"isLogonSuccessful":false}');

// Start a session.
session_start();

// Delete any session information, if one already existed.
session_unset();

// Grab the POST elements.
$usernameEntered = $_POST['username'];
$passwordEntered = $_POST['password'];

// This token needs to be visible in the try and finally blocks below.
$authenticationConnection = NULL;

try {
    // A connection to the database through the Authentication user.
    $authenticationConnection = new AuthenticationConnection();

    // Get the ID associated with the username entered.
    $userID = $authenticationConnection->getUserID($usernameEntered);

    // If AuthenticationConnection::getUserID(string) returns FALSE, no user
    // with the entered username exists; throw an Exception.
    if($userID === FALSE) {
        throw new Exception('No user exists having the entered username.');
    }

    // Get the salted and hashed password associated with userID.
    $saltedAndHashedPassword =
        $authenticationConnection->getSaltedAndHashedPassword($userID);

    // Close $authenticationConnection; it is no longer needed.
    $authenticationConnection->close();

    // If AuthenticationConnection::getSaltedAndHashedPasswords(string) returns
    // NULL, no password is associated with the user; throw an Exception.
    if(!$saltedAndHashedPassword) {
        throw new Exception(
            'No password is associated with the entered username.');
    }

    // Verify the entered password against the salted and hashed password in the
    // database; if password_verify(string,string) returns FALSE, the password
    // entered does not match the one in the database; throw an Exception.
    if(!password_verify($passwordEntered, $saltedAndHashedPassword)) {
        throw new Exception(
            'The password provided does not match the salted and hashed one '
                . 'stored in the database.');
    }

    // If we make it here, the logon was successful; set the session userID
    // variable to $userID.
    $_SESSION['userID'] = $userID;
} catch($e) {
    // If any exceptions or errors were thrown above ...

    // ... unset all session variables, ...
    session_unset();

    // ... destroy any existing session ...
    session_destroy();

    // ... and exit yielding the JSON object for an unsuccessful logon attempt.
    exit(LOGON_UNSUCCESSFUL_JSON);
} finally {
    // Make sure to close $authenticationConnection, if it exists.
    if($authenticationConnection) {
        $authenticationConnection->close();
    }
}

// If we make it here, the logon was successful, so exit yielding the JSON
// object for a successful logon attempt.
exit(LOGON_SUCCESSFUL_JSON);

