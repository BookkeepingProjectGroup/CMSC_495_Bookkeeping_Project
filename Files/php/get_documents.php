<?php

/*
 * File: get_documents.php
 * Author(s): Matthew Dobson
 * Last modified: 2018-12-09
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

require_once('PhpConnection.php');

function exitYieldingJSON(
    bool $success,
    bool $userNotLoggedIn,
    array $documents = NULL
) {
    $successAndDocuments = $success && $documents;

    $responseObject = array('success' => $successAndDocuments);

    if($successAndDocuments) {
        $responseObject['documents'] = $documents;
    } else {
        $responseObject['userNotLoggedIn'] = $userNotLoggedIn;
    }

    echo(json_encode($responseObject));

    exit();
}

session_start();

if(!array_key_exists('userID', $_SESSION)) {
    exitYieldingJSON(FALSE, TRUE);
}

try {
    $phpConnection = new PhpConnection();

    $documents = $phpConnection->getDocuments($_SESSION['userID']);

    $phpConnection->close();

    exitYieldingJSON(TRUE, FALSE, $documents);
} catch(Throwable $e) {
    if(isset($phpConnection)) {
        $phpConnection->close();
    }

    exitYieldingJSON(FALSE, FALSE);
}

