<?php

/*
 * File: get_general_ledger_rows.php
 * Author(s): Matthew Dobson
 * Date last modified: 2018-12-15
 * Description: An end-point for fetching all of the general ledger rows
 * associated with a given document name.
 *
 * It expects POST parameter "documentName".
 *
 * On success, its return object is:
 *
 * {
 *     "success": true,
 *     "generalLedgerRows": [
 *         {
 *             "code": "1000",
 *             "date": "2018-12-11",
 *             "debit": "100.00"
 *             "description": "Deposit of check"
 *         },
 *         ...
 *     ]
 * }
 *
 * On failure due to no user being logged-in, its return object is:
 *
 * {
 *     "success": false,
 *     "userNotLoggedIn": true
 * }
 *
 * On failure when a user is logged-in but the document does not exist or some
 * other reason, its return object is:
 *
 * {
 *     "success": false,
 *     "userNotLoggedIn": false,
 *     "documentNonexistent": true|false
 * }
 */

require_once(__DIR__ . '/include/ini.php');
require_once(__DIR__ . '/include/PhpConnection.php');

/**
 * A method which produces the output JSON object, outputs it to the browser and
 * exits the script.
 *
 * @param $userNotLoggedIn TRUE if no user is logged in, FALSE otherwise.
 * @param $generalLedgerRows (default value: NULL) a numeric array of
 * associative arrays containing the information about the general ledger rows
 * to be sent to the browser; an empty array (which is not === to NULL) is
 * interpretted as meaning the document is nonexistent.
 */
function exitYieldingJSON(
    bool $userNotLoggedIn,
    array $generalLedgerRows = NULL
) {
    // Compute the value of response object parameter "success".
    $success = (!$userNotLoggedIn) && $generalLedgerRows;

    // Initialize the response object with parameter "success" equal to
    // $success.
    $responseObject = array('success' => $success);

    if($success) {
        // If $success is TRUE ...

        // Add $generalLedgerRows to the response object as parameter
        // "generalLedgerRows".
        $responseObject['generalLedgerRows'] = $generalLedgerRows;
    } else {
        // If $success is FALSE ...

        // Add $userNotLoggedIn to the response object as parameter
        // "userNotLoggedIn".
        $responseObject['userNotLoggedIn'] = $userNotLoggedIn;

        if(!$userNotLoggedIn) {
            // If $userNotLoggedIn is FALSE ...

            // Add response object parameter "documentNonexistent", TRUE if 
            // $generalLedgerRows is not exactly NULL, FALSE otherwise.
            $responseObject['documentNonexistent'] = (
                $generalLedgerRows !== NULL
            );
        }
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
    exitYieldingJSON(TRUE);
}

if(!array_key_exists('documentName', $_POST)) {
    // If no POST "documentName" is set ...

    // Exit yielding "success": false, "userNotLoggedIn": false, 
    // "documentNonexistent": false.
    exitYieldingJSON(FALSE);
}

try {
    // Connect to the database as user "php".
    $phpConnection = new PhpConnection();

    // Fetch the general ledger rows in the logged-in user's document named in
    // POST parameter "documentName".
    $generalLedgerRows = $phpConnection->getGeneralLedgerLines(
        $_SESSION['userID'],
        $_POST['documentName']
    );

    // Close the database connection.
    $phpConnection->close();

    // Exit yielding "success": true, "generalLedgerRows": the fetched general
    // ledger rows. (If $generalLedgerRows is an empty array, exitYieldingJSON(
    // bool[,array]) will yield "success": false, "userNotLoggedIn": false,
    // "documentNonexistent": true.)
    exitYieldingJSON(FALSE, $generalLedgerRows);
} catch(Throwable $e) {
    // If any exception or error is thrown in the above ...

    if(isset($phpConnection)) {
        // If $phpConnection is set ...

        // Close the database connection.
        $phpConnection->close();
    }

    // Exit yielding "success": false, "userNotLoggedIn": false,
    // "documentNonexistent": false.
    exitYieldingJSON(FALSE);
}


