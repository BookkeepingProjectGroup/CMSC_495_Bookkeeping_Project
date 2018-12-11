<?php

/*
 * File: get_accounts.php
 * Author(s): Matthew Dobson
 * Date last modified: 2018-12-11
 * Description: An end-point for getting all of the logged-in user's accounts. A
 * successful response appears as follows:
 *
 * {
 *     "success": true,
 *     "accounts": [
 *         {
 *             "code": "1000",
 *             "name": "Cash",
 *             "type": "ASSET"
 *         },
 *         ...
 *     ]
 * }
 *
 * A failure response appears as follows:
 *
 * {
 *     "success": false,
 *     "userNotLoggedIn": true|false
 * }
 */

require_once('PhpConnection.php');

/**
 * A method which produces the output JSON object, outputs it to the browser and
 * exits the script.
 *
 * @param $success TRUE if the user's accounts were fetched successfully, FALSE
 * otherwise.
 * @param $userNotLoggedIn TRUE if no user is logged in, FALSE otherwise.
 * @param $accounts (default value: NULL) a numeric array of associative arrays
 * containing the information about the user's accounts to be sent to the
 * browser.
 */
function exitYieldingJSON(
    bool $success,
    bool $userNotLoggedIn,
    array $accounts = NULL
) {
    // Compute the value of $success AND $accounts (if $accounts is NULL, it
    // evaluates to FALSE).
    $successAndAccounts = $success && $accounts;

    // Initialize the response object with parameter "success" equal to
    // $successAndAccounts.
    $responseObject = array('success' => $successAndAccounts);

    if($successAndAccounts) {
        // If $successAndAccounts is TRUE ...

        // Add $accounts to the response object as parameter "accounts".
        $responseObject['accounts'] = $accounts;
    } else {
        // If $successAndAccounts is FALSE ...

        // Add $userNotLoggedIn to the response object as parameter
        // "userNotLoggedIn".
        $responseObject['userNotLoggedIn'] = $userNotLoggedIn;
    }

    // Yield the response object to the browser.
    echo(json_encode($responseObject));

    // Exit.
    exit();
}

// Start the session.
session_start();

if(!array_key_exists('userID', $_SESSION)) {
    // If no session "userID" is set ...

    // Exit yielding "success": false, "userNotLoggedIn": true.
    exitYieldingJSON(FALSE, TRUE);
}

try {
    // Connect to the database as user "php".
    $phpConnection = new PhpConnection();

    // Fetch the accounts of the logged-in user.
    $accounts = $phpConnection->getAccounts($_SESSION['userID']);

    // Close the database connection.
    $phpConnection->close();

    // Exit yielding "success": true, "userNotLoggedIn": false, "accounts": the
    // fetched accounts.
    exitYieldingJSON(TRUE, FALSE, $accounts);
} catch(Throwable $e) {
    // If any exception or error is thrown in the above ...

    if(isset($phpConnection)) {
        // If $phpConnection is set ...

        // Close the database connection.
        $phpConnection->close();
    }

    // Exit yielding "success": false, "userNotLoggedIn": false.
    exitYieldingJSON(FALSE, FALSE);
}

