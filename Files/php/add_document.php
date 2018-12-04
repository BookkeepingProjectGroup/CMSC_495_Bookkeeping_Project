<?php

/*
 * File: add_document.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-04
 * Description: An end-point for adding a bookkeeping document with its
 * associated general ledger rows to the database.
 *
 * This end-point expects to see a POST parameters "documentName", containing
 * the name of the new document; "type", containing the type of the new
 * document; "generalLedgerRows", containing a JSON list of JSON objects
 * representing each of the rows to be added to the general ledger (see
 * explanation below); "customerName", (optional) containing the name of the
 * customer; and "vendorName", (optional) containing the name of the vendor.
 *
 * An example generalLedgerRows JSON list:
 * [
 *     {
 *         "code": "1000",
 *         "date": "2018-01-01",
 *         "debit": "1000.00",
 *         "description": "Loan"
 *     },
 *     {
 *         "code": "2400",
 *         "date": "2018-01-01",
 *         "credit": "1000.00",
 *         "description": "Loan
 *     }
 * ]
 *
 * A JSON object is returned containing boolean value "success".
 */

include('PhpConnection.php');

// Define JSON responses for success and failure.
define('SUCCESS_JSON', '{"success":true}');
define('FAILURE_JSON', '{"success":false}');

// Start the session.
session_start();

try {
    // If no userID is set for the session, no user is logged-in, so throw an
    // exception.
    if(!array_key_exists('userID', $_SESSION))
        throw new Exception('No user is logged-in.');

    // If the front-end has not POSTed all of "documentName", "type" and
    // "generalLedgerRows", throw an exception.
    if(
        (!array_key_exists('documentName', $_POST))
            || (!array_key_exists('type', $_POST))
            || (!array_key_exists('generalLedgerRows', $_POST)))
        throw new Exception(
            'No new document name, type and/or general legder rows given.');

    // Decode the JSON-encoded POST parameter "generalLedgerRows", capturing
    // objects as associative arrays.
    $generalLedgerRows = json_decode($_POST['generalLedgerRows'], TRUE, 3);

    // If there was a JSON error or $generalLedgerRows is empty, throw an
    // exception.
    if((json_last_error() !== JSON_ERROR_NONE) || (!$generalLedgerRows))
        throw new Exception(
            'An error occurred getting the general ledger rows from the JSON.');

    // Initialize an array in which to store general ledger rows to pass as an
    // argument to
    // PhpConnection::addDocument(string,string,string,array[,string[,string]]).
    $preparedGeneralLedgerRows = array();

    foreach($generalLedgerRows as $generalLedgerRow) {
        // For each general ledger row decoded from the JSON ...

        // If the general ledger row is missing any of parameters "code", "date"
        // and "description", throw an exception.
        if(
            (!array_key_exists('code', $generalLedgerRow))
                || (!array_key_exists('date', $generalLedgerRow))
                || (!array_key_exists('description', $generalLedgerRow)))
            throw new Exception(
                'No account code, date and/or description given in general '
                    . 'ledger row.');

        if(array_key_exists('debit', $generalLedgerRow)) {
            // If the general ledger row includes parameter "debit", set
            // $isDebit to TRUE.
            $isDebit = TRUE;
        } else {
            // If the general ledger row does not include parameter "debit" ...

            // Ensure that the general ledger row does include parameter
            // "credit"; if not, throw an exception.
            if(!array_key_exists('credit', $generalLedgerRow))
                throw new Exception(
                    'No debit or credit given in general ledger row.');

            // Set $isDebit to FALSE.
            $isDebit = FALSE;
        }

        // Produce a clean general ledger row from the one decoded from the
        // JSON and append it to $preparedGeneralLedgerRows. (See documentation
        // for PhpConnection::
        // addDocument(string,string,string,array[,string[,string]]), the method
        // to which $preparedGeneralLedgerRows will be passed.
        $preparedGeneralLedgerRows[] =
            array_merge(
                array_intersect_key(
                    $generalLedgerRow,
                    array_merge(
                        array(
                            'code' => NULL,
                            'date' => NULL,
                            'description' => NULL),
                        $isDebit
                            ? array('debit' => NULL)
                            : array('credit' => NULL))), 
                array('isDebit' => $isDebit));
    }

    // Open a connection to the database with user php.
    $phpConnection = new PhpConnection();

    // Add the document to the database.
    $addDocumentErrorCode =
        $phpConnection->addDocument(
            $_SESSION['userID'],
            $_POST['documentName'],
            $_POST['type'],
            $preparedGeneralLedgerRows,
            array_key_exists('customerName', $_POST)
                ? $_POST['customerName']
                : NULL,
            array_key_exists('vendorName', $_POST)
                ? $_POST['vendorName']
                : NULL);

    // If
    // PhpConnection::addDocument(string,string,string,array[,string[,string]])
    // returns anything other than PhpConnection::ADDDOCUMENT_ERROR_NO_ERROR, an
    // error occurred, so throw an exception.
    if($addDocumentErrorCode !== PhpConnection::ADDDOCUMENT_ERROR_NO_ERROR)
        throw new Exception(
            "PhpConnection::"
            . "addDocument(string,string,string,array[,string[,string]]) failed"
            . " with error code $addDocumentErrorCode.");
} catch(Throwable $e) {
    // If any exceptions or errors were thrown...

    // Yeild the JSON object for failure.
    echo FAILURE_JSON;

    // Exit.
    exit();
} finally {
    // Make sure the database connection gets closed.
    if(isset($phpConnection)) $phpConnection->close();
}

// Yield the JSON object for success.
echo SUCCESS_JSON;

