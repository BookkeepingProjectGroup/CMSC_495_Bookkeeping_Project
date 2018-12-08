<?php

/*
 * File: create_default_accounts.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-08
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

require_once('PhpConnection.php');

start_session();

$replyObject = array('success' => FALSE);

if(!array_key_exists('userID', $_SESSION)) {
    $replyObject['userLoggedIn'] = FALSE;

    echo json_encode($replyObject);

    exit();
}

try {
    $phpConnection = new PhpConnection();

    $replyObject['accountsAdded'] = $phpConnection->addDefaultAccounts(
        $_SESSION['userID']
    );

    $phpConnection->close();

    unset($phpConnection);

    echo json_encode($replyObject);
} catch(Throwable $e) {
    if(isset($replyObject['accountsAdded'])) {
        unset($replyObject['accountsAdded']);
    }

    $replyObject['userLoggedIn'] = TRUE;

    echo json_encode($replyObject);

    exit();
} finally {
    if(isset($phpConnection)) {
        $phpConnection->close();
    }
}

