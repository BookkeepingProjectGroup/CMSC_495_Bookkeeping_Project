<?php

/*
 * File: add_account.php
 * Author(s): Matthew Dobson
 * Last modified: 2018-12-15
 * Description: An end-point for adding an account to the database for a user.
 * It expects three POST parameters: "code", "name" and "type". It returns a
 * JSON object containing parameter "success". If "success" is false, the object
 * returned will also include parameter "userNotLoggedIn". If "userNotLoggedIn"
 * is false, the object returned will also include parameter
 * "accountAlreadyExists".
 */

require_once(__DIR__ . '/include/ini.php');
require_once(__DIR__ . '/include/PhpConnection.php');

/**
 * A method for yielding this end-point's JSON response object and exiting the
 * script.
 *
 * @param $success (default value: TRUE) TRUE if the account was added
 * successfully; FALSE otherwise.
 * @param $userNotLoggedIn (default value: FALSE) TRUE if no user is logged-in;
 * FALSE otherwise.
 * @param $accountAlreadyExists (default value: FALSE) TRUE if the logged-in
 * user already has an account with the specified code; FALSE otherwise.
 */
function exitYieldingJSON(
    bool $success = TRUE,
    bool $userNotLoggedIn = FALSE,
    bool $accountAlreadyExists = FALSE
) {
    // Initialize the response object by building its "success" parameter and
    // assigning it the value of $success.
    $responseObject = array('success' => $success);

    if(!$success) {
        // If the account addition was unsuccessful, we need to add one or two
        // more parameters to the response object, so ...

        // Add the response object's "userNotLoggedIn" parameter, and assign it
        // the value of $userNotLoggedIn.
        $responseObject['userNotLoggedIn'] = $userNotLoggedIn;

        if(!$userNotLoggedIn) {
            // If the account addition was unsuccessful and a user is logged-in,
            // we need to add one more parameter to the response object, so ...

            // Add the response object's "accountAlreadyExists" parameter, and
            // assign it the value of $accountAlreadyExists.
            $responseObject['accountAlreadyExists'] = $accountAlreadyExists;
        }
    }

    // Encode the response object in JSON and output it to the browser.
    echo(json_encode($responseObject));

    // Exit.
    exit();
}

// Start the session.
session_start();

if(!array_key_exists('userID', $_SESSION)) {
    // If "userID" is not set for this session ...

    // Exit with "success": false, "userNotLoggedIn": true,
    // "accountAlreadyExists": false.
    exitYieldingJSON(FALSE, TRUE);
}

if(
    (!array_key_exists('code', $_POST))
    || (!array_key_exists('name', $_POST))
    || (!array_key_exists('type', $_POST))
) {
    // If one or more of POST parameters "code", "name" and "type" are
    // missing ...

    // Exit with "success": false, "userNotLoggedIn": false,
    // "accountAlreadyExists": false.
    exitYieldingJSON(FALSE);
}

try {
    // Connect to the database through user "php".
    $phpConnection = new PhpConnection();

    // Attempt to add the account to the database.
    $additionSuccess = $phpConnection->addAccount(
        $_SESSION['userID'],
        $_POST['code'],
        $_POST['name'],
        $_POST['type']
    );

    // Close the connection to the database.
    $phpConnection->close();
} catch(Throwable $e) {
    // If any exception or error was thrown in the above ...

    if(isset($phpConnection)) {
        // If $phpConnection is set ...

        // Close the connection to the database.
        $phpConnection->close();
    }

    // Exit with "success": false, "userNotLoggedIn": false,
    // "accountAlreadyExists": false.
    exitYieldingJSON(FALSE);
}

// Exit with "success": the value returned by PhpConnection::addAccount(string,
// string,string,string) [boolval(mixed) converts the possible NULL to FALSE],
// "userNotLoggedIn": false, "accountAlreadyExists": true if PhpConnection::
// addAccount(string,string,string,string) returned NULL, otherwise false.
exitYieldingJSON(boolval($additionSuccess), FALSE, $additionSuccess === NULL);

