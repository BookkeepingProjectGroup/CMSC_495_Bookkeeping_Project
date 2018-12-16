<?php

/*
 * File: create_user.php
 * Author(s): Matthew Dobson
 * Last modified: 2018-12-15
 * Description: An end-point for adding a new user account to the database. It
 * expects POST parameters "username" and "password" and returns a JSON object
 * containing boolean parameter "success" and, if "success" is false, boolean
 * parameter "duplicate", which is true if the given username is already taken.
 */

require_once(__DIR__ . '/include/ini.php');
require_once(__DIR__ . '/include/DuplicateException.php');
require_once(__DIR__ . '/include/PasswordsConnection.php');
require_once(__DIR__ . '/include/UsersConnection.php');

// Define JSON objects for success, failure due to existence of username
// already and other, unspecified failure.
define('SUCCESS_JSON', '{"success":true}');
define('DUPLICATE_JSON', '{"success":false,"duplicate":true}');
define('OTHER_FAILURE_JSON', '{"success":false,"duplicate":false}');

// Start the session.
session_start();

// If a session is already active, delete its data.
session_unset();

try {
    // If one or both of POST parameters "username" and "password" is/are
    // missing, throw an Exception.
    if(
        (!array_key_exists('username', $_POST))
            || (!array_key_exists('password', $_POST)))
        throw new Exception('No new username and/or password provided.');

    // Connect to the database using user users.
    $usersConnection = new UsersConnection();

    // Add the user to the database.
    $userID = $usersConnection->addUser($_POST['username']);

    // Close the connection to the database and unset its token.
    $usersConnection->close();
    unset($usersConnection);

    // If UsersConnection::addUser(string) returned NULL, the username already
    // exists, so throw a DuplicateException.
    if($userID === NULL)
        throw new DuplicateException('The username provided already exists.');

    // If UsersConnection::addUser(string) returned FALSE, some unspecified
    // error occurred, so throw an Exception.
    if($userID === FALSE)
        throw new Exception('UsersConnection::addUser(string) failed.');

    // Connect to the database using user passwords.
    $passwordsConnection = new PasswordsConnection();

    // Set the password of the new user. If
    // PasswordsConnection::setUserPassword(string,string) returns FALSE, an
    // unspecified error occurred, so throw an Exception.
    if(!$passwordsConnection->setUserPassword($userID, $_POST['password']))
        throw new Exception(
            'PasswordsConnection::setUserPassword(string,string) failed.');
} catch(DuplicateException $ex) {
    // If a DuplicateException is thrown ...

    // Yield the JSON object for a username already taken.
    echo DUPLICATE_JSON;

    // Exit.
    exit();
} catch(Throwable $e) {
    // If any other exception or error is thrown ...

    // Yield the JSON object for an unspecified failure.
    echo OTHER_FAILURE_JSON;

    // Exit.
    exit();
} finally {
    // Make sure the database connections are closed.
    if(isset($usersConnection)) $usersConnection->close();
    if(isset($passwordsConnection)) $passwordsConnection->close();
}

// Yield the JSON object for success.
echo SUCCESS_JSON;

