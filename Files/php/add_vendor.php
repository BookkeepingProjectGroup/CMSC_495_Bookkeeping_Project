<?php

/*
 * File: add_vendor.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-15
 * Description: An end-point for adding a vendor; received POST parameters
 * "name" and "address"; returns a JSON object with boolean elements
 * "success" and "duplicate", the latter of which is set to true when the
 * vendor already existed.
 */

require_once(__DIR__ . '/include/ini.php');
require_once(__DIR__ . '/include/PhpConnection.php');

// JSON replies for success, failure due to vendor already existing and other
// failure.
define('SUCCESS_JSON', '{"success":true,"duplicate":false}');
define('DUPLICATE_JSON', '{"success":false,"duplicate":true}');
define('OTHER_FAILURE_JSON', '{"success":false,"duplicate":false}');

// Start the session.
session_start();

// Fetch the session userID.
$sessionUserID = $_SESSION['userID'];

// Fetch the new vendor name and address POSTed by the front-end.
$nameEntered = $_POST['name'];
$addressEntered = $_POST['address'];

// This needs to be visible in both the try and finally blocks below.
$phpConnection = NULL;

// This needs to be visible both inside and outside the try block below.
$success = NULL;

try {
    // If this session has no userID set, no user is logged-in, so throw an
    // Exception.
    if(!$sessionUserID) throw new Exception('No user is logged-in.');

    // If no vendor name has come in from the front-end, throw an Exception.
    if(!$nameEntered) throw new Exception('No vendor name was provided.');

    // Open a connection to the database through user php.
    $phpConnection = new PhpConnection();

    // Add the vendor to the database;
    // PhpConnection::addVendor(string,string,string) returns TRUE if the
    // vendor was added successfully, FALSE if the vendor already existed.
    $success = 
        $phpConnection->addVendor(
            $sessionUserID,
            $nameEntered,
            $addressEntered);
} catch(Throwable $e) {
    // If any exceptions or errors were thrown above ...

    // ... yield the JSON object for an unspecified failure ...
    echo OTHER_FAILURE_JSON;

    // ... and exit.
    exit();
} finally {
    // Make sure the database connection gets closed.
    if($phpConnection) $phpConnection->close();
}

// If we make it here, the vendor was either added or already existed; yield
// the corresponding JSON object.
echo $success ? SUCCESS_JSON : DUPLICATE_JSON;

