<?php

/*
 * File: get_customers.php
 * Author(s): Matthew Dobson
 * Date modified: 11-28-2018
 * Description: An end-point for the front-end to fetch a list of a user's
 * customers from the back-end. The list is returned as a JSON object containing
 * a "success" parameter and a list of JSON objects with parameters "name" and
 * "address":
 *
 * {
 *     "success": true,
 *     "customers": [
 *         { "name": "Joe Blow", "address": "somewhere" },
 *         ...
 *     ]
 * }
 */

include('PhpConnection.php');

// JSON reply for failure.
define('FAILURE_JSON', '{"success":false}');

// Start the session.
session_start();

// Fetch the session userID.
$sessionUserID = $_SESSION['userID'];

// This needs to be visible in both the try and finally blocks below.
$phpConnection = NULL;

// This needs to be visible both inside and outside the try block below.
$response = NULL;

try {
    // If this session has no userID set, no user is logged-in, so throw an
    // Exception.
    if(!$sessionUserID) throw new Exception('No user is logged-in.');

    // Open a connection to the database through user php.
    $phpConnection = new PhpConnection();

    // Assemble a successful response, fetching the customer list from the
    // database.
    $response =
        json_encode(
            array(
                'success' => TRUE,
                'customers' => $phpConnection->getCustomers($sessionUserID)));
} catch(Throwable $e) {
    // If any exceptions or errors were thrown above ...

    // ... yield the JSON object for failure ...
    echo FAILURE_JSON;

    // ... and exit.
    exit();
} finally {
    // Make sure the database connection gets closed.
    if($phpConnection) $phpConnection->close();
}

// If we make it here, no exceptions were thrown, so if $response was set, yeild
// it; if not, yield the JSON object for failure.
echo ($response) ? $response : FAILURE_JSON;

