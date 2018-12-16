<?php

/*
 * File: create_default_accounts.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-15
 * Description: An end-point for adding a group of default accounts to the
 * database for a user. It takes no parameters and returns a JSON object
 * containing a "success" parameter and a list of accounts added:
 *
 * {
 *     "success": true,
 *     "accountsAdded": [
 *          {
 *              "code": "1000",
 *              "name": "Cash",
 *              "type": "ASSET"
 *          },
 *          ...
 *     ]
 * }
 *
 * or a failure object:
 *
 * {
 *     "success": false,
 *     "userLoggedIn": false|true
 * }
 */

require_once(__DIR__ . '/include/ini.php');
require_once(__DIR__ . '/include/PhpConnection.php');

// Start the session.
session_start();

// Initialize the JSON reply object.
$replyObject = array('success' => FALSE);

if(!array_key_exists('userID', $_SESSION)) {
    // If "userID" is not set for this session ...

    // Add parameter "userLoggedIn" to the reply object, and set it to FALSE.
    $replyObject['userLoggedIn'] = FALSE;

    // Yield the JSON reply object.
    echo json_encode($replyObject);

    // Exit.
    exit();
}

try {
    // Connect to the database through user "php".
    $phpConnection = new PhpConnection();

    // Add the default accounts for the session user; store the returned list of
    // accounts added into parameter "accountsAdded" in the JSON reply object.
    $replyObject['accountsAdded'] = $phpConnection->addDefaultAccounts(
        $_SESSION['userID']
    );

    // Close the database connection, and unset its token.
    $phpConnection->close();
    unset($phpConnection);

    // Set the JSON reply object's "success" parameter to TRUE.
    $replyObject['success'] = TRUE;

    // Yield the JSON reply object.
    echo json_encode($replyObject);
} catch(Throwable $e) {
    // If any exception or error is thrown above ...

    if(isset($replyObject['accountsAdded'])) {
        // If the JSON reply object's "accountsAdded" parameter became set ...

        // Unset it.
        unset($replyObject['accountsAdded']);
    }

    // Set the JSON reply object's "userLoggedIn" parameter to TRUE.
    $replyObject['userLoggedIn'] = TRUE;

    // Yield the JSON reply object.
    echo json_encode($replyObject);

    // Exit.
    exit();
} finally {
    // If an exception is thrown in the above ...

    if(isset($phpConnection)) {
        // If $phpConnection is set ...

        // Unset it.
        $phpConnection->close();
    }
}

