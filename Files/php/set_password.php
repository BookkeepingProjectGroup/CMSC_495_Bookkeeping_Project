<?php

/*
 * File: set_password.php
 * Author(s): Matthew Dobson
 * Date modified: 11-24-2018
 * Description: An end-point for changing a user's password.
 */

include('PasswordsConnection.php');

// JSON replies for successful and unsuccessful password sets.
define('SET_PASSWORD_SUCCESSFUL_JSON', '{"isPasswordSetSuccessful":true}');
define('SET_PASSWORD_UNSUCCESSFUL_JSON', '{"isPasswordSetSuccessful":false}');

// Start the session.
session_start();

// Fetch the session userID.
$sessionUserID = $_SESSION['userID'];

// Fetch the new password POSTed by the front-end.
$newPassword = $_POST['password'];

// This needs to be visible in both the try and finally blocks below.
$passwordsConnection = NULL;

try {
    // If this session has no userID set, no user is logged-in, so throw an
    // Exception.
    if(!$sessionUserID) throw new Exception('No user is logged-in.');

    // If no new password has come in from the front-end, throw an Exception.
    if(!$newPassword) throw new Exception('No new password was provided.');

    // Open a connection to the database through user passwords.
    $passwordsConnection = new PasswordsConnection();

    // Set the password for the user; if
    // PasswordsConnection::setUserPassword(string,string) returns FALSE a new
    // password was not set, so throw an exception.
    if(!$passwordsConnection->setUserPassword($sessionUserID, $newPassword))
        throw new Exception('The new password was not set.');
} catch(Throwable $e) {
    // If any exceptions or errors were thrown above ...

    // ... yield the JSON object for an unsuccessful password change attempt ...
    echo SET_PASSWORD_UNSUCCESSFUL_JSON;

    // ... and exit.
    exit();
} finally {
    // Make sure the database connection gets closed.
    if($passwordsConnection) $passwordsConnection->close();
}

// If we make it here, the password change attempt was successful, so yield the
// JSON object for a successful password change attempt.
echo SET_PASSWORD_SUCCESSFUL_JSON;

