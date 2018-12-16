<?php

/*
 * File: get_documents.php
 * Author(s): Matthew Dobson
 * Last modified: 2018-12-15
 * Description: An end-point to fetch a JSON list containing the "documentName",
 * "documentType", "customerName" (if the document type is "ARI" or "ARR") and
 * "vendorName" (if the document type is "API" or "APD") of each of the logged-
 * in user's documents.
 *
 * On success, the format of the returned JSON object is as follows:
 *
 * {
 *     "success": true,
 *     "documents": [
 *         {
 *             "documentName": "JournalEntry1",
 *             "documentType": "JE"
 *         },
 *         {
 *             "documentName": "APInvoice1",
 *             "documentType": "API",
 *             "vendorName": "Example, Inc."
 *         },
 *         {
 *             "documentName": "ARReceipt1",
 *             "documentType": "ARR",
 *             "customerName": "Joe Blow"
 *         }
 *     ]
 * }
 *
 * On failure, the format of the returned JSON object is as follows:
 *
 * {
 *     "success": false,
 *     "userNotLoggedIn": true|false
 * }
 */

require_once(__DIR__ . '/include/ini.php');
require_once(__DIR__ . '/include/PhpConnection.php');

/**
 * A method which produces the output JSON object, outputs it to the browser and
 * exits the script.
 *
 * @param $success TRUE if the user's documents were fetched successfully, FALSE
 * otherwise.
 * @param $userNotLoggedIn TRUE if no user is logged in, FALSE otherwise.
 * @param $documents (default value: NULL) a numeric array of associative arrays
 * containing the information about the user's documents to be sent to the
 * browser.
 */
function exitYieldingJSON(
    bool $success,
    bool $userNotLoggedIn,
    array $documents = NULL
) {
    // Compute the value of $success AND $documents (if $documents is NULL, it
    // evaluates to FALSE).
    $successAndDocuments = $success && $documents;

    // Initialize the response object with parameter "success" equal to
    // $successAndDocuments.
    $responseObject = array('success' => $successAndDocuments);

    if($successAndDocuments) {
        // If $successAndDocuments is TRUE ...

        // Add $documents to the response object as parameter "documents".
        $responseObject['documents'] = $documents;
    } else {
        // If $successAndDocuments is FALSE ...

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

    // Fetch the documents of the logged-in user.
    $documents = $phpConnection->getDocuments($_SESSION['userID']);

    // Close the database connection.
    $phpConnection->close();

    // Exit yielding "success": true, "userNotLoggedIn": false, "documents": the
    // fetched documents.
    exitYieldingJSON(TRUE, FALSE, $documents);
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

