<?php

/*
 * File: PhpConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-28-2018
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user php.
 */

include_once 'DatabaseConnection.php';

/** A class representing a connection MariaDB SQL database as user php. */
class PhpConnection extends DatabaseConnection {
    /** The username of user php. */
    const USER_PHP_USERNAME = 'php';

    /** The credentials file for user php. */
    const USER_PHP_CREDENTIALS_FILENAME = '../json/phpLogon.json';

    /**
     * The sole constructor to be used for this subclass.
     */
    public function __construct() {
        parent::__construct(
            self::USER_PHP_USERNAME, self::USER_PHP_CREDENTIALS_FILENAME);
    }

    /**
     * A method to add a customer to the database.
     *
     * @param $userID the ID of the user with whom this customer is associated.
     * @param $name the name of the customer.
     * @param $address the address of the customer.
     *
     * @return TRUE if the customer was added successfully; FALSE if the user
     * already has a customer by that name.
     */
    public function addCustomer(string $userID, string $name, string $address) {
        return $this->addCustomerOrVendor(TRUE, $userID, $name, $address);
    }

    /**
     * A method to add a document with its general ledger rows to the database.
     *
     * @param $userID the ID of the user with which the document is associated.
     * @param $documentName the name of the document.
     * @param $type the type of the document.
     * @param $generalLedgerRows a numeric array of generalLedgerRows; each must
     * be an object containing parameters "code", as in account code; "date";
     * "isDebit"; "debit" or "credit"; and "description".
     * @param $customerName the name of the customer if $type is "ARI" or "ARR".
     * @param $vendorName the name of the vendor if $type is "API" or "APD".
     *
     * @return 
     */
    public function addDocument(
        string $userID,
        string $documentName,
        string $type,
        array $generalLedgerRows,
        string $customerName = NULL,
        string $vendorName = NULL) {
        $documentAlreadyExistsResult =
            $this->runQuery(
                'SELECT ID FROM BooksDB.Documents '
                    . 'WHERE (userID = ?) AND (name = ?)',
                'ss',
                $userID,
                $documentName);

        if($documentAlreadyExistsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        if(count($documentAlreadyExistsResult) !== 0) return FALSE;

        if(strcmp($type, 'ARI') || strcmp($type, 'ARR')) {
            if((!$customerName) || $vendorName) return FALSE;

            $getCustomerIDResult =
                $this->runQuery(
                    'SELECT ID FROM BooksDB.Customers '
                        . 'WHERE (userID = ?) AND (name = ?)',
                    'ss',
                    $userID,
                    $customerName);
        }
    }

    /**
     * A method to add a customer or vendor to the database.
     *
     * @param $isCustomer TRUE to add a customer, FALSE to add a vendor.
     * @param $userID the ID of the user with whom this customer or vendor is
     * associated.
     * @param $name the name of the customer or vendor.
     * @param $address the address of the customer or vendor.
     *
     * @return TRUE if the customer or vendor was added successfully; FALSE if
     * the user already has a customer/vendor by that name.
     */
    private function addCustomerOrVendor(
        bool $isCustomer,
        string $userID,
        string $name,
        string $address) {
        // Query the database to see if the user already has a customer/vendor
        // with the given name.
        $customerOrVendorAlreadyExistsResult =
            $this->runQuery(
                'SELECT ID FROM BooksDB.' 
                    . ($isCustomer ? 'Customers' : 'Vendors')
                    . ' WHERE (userID = ?) AND (name = ?)',
                'ss',
                $userID,
                $name);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($customerOrVendorAlreadyExistsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // If the query result does not have exactly 0 contents, the user
        // already has a customer/vendor with the given name, so return FALSE.
        if(count($customerOrVendorAlreadyExistsResult) !== 0) return FALSE;

        // Insert the new customer/vendor into the database.
        $this->runQuery(
            'INSERT INTO BooksDB.'
                . ($isCustomer ? 'Customers' : 'Vendors')
                . ' (userID, name, address) VALUES (?, ?, ?)',
            'sss',
            $userID,
            $name,
            $address);

        // If we made it here, everything must have gone well, so return TRUE.
        // (It is possible the insertion was unsuccessful, but no exceptions
        // were thrown by it; worst case the customer/vendor was not actually
        // added to the database.)
        return TRUE;
    }

    /**
     * A method to add a vendor to the database.
     *
     * @param $userID the ID of the user with whom this vendor is associated.
     * @param $name the name of the vendor.
     * @param $address the address of the vendor.
     *
     * @return TRUE if the vendor was added successfully; FALSE if the user
     * already has a vendor by that name.
     */
    public function addVendor(string $userID, string $name, string $address) {
        return $this->addCustomerOrVendor(FALSE, $userID, $name, $address);
    }

    /**
     * A method to get all of the customers of a user.
     *
     * @param $userID the ID of the user.
     *
     * @return a numeric array of associative arrays containing elements "name"
     * and "address".
     */
    public function getCustomers(string $userID) {
        return $this->getCustomersOrVendors(TRUE, $userID);
    }

    /**
     * A method to get all of the customers or vendors of a user.
     *
     * @param $userID the ID of the user.
     *
     * @return a numeric array of associative arrays containing elements "name"
     * and "address".
     */
    private function getCustomersOrVendors(bool $customers, string $userID) {
        // Select all of the user's customers/vendors from the database.
        $getCustomersOrVendorsResult = $this->runQuery(
            'SELECT name, address FROM BooksDB.'
                . ($customers ? 'Customers' : 'Vendors')
                . ' WHERE userID = ?',
            's',
            $userID);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($getCustomersOrVendorsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // Return the numeric array of associative arrays containing all of the
        // user's customers/vendors.
        return $getCustomersOrVendorsResult;
    }

    /**
     * A method to get all of the vendors of a user.
     *
     * @param $userID the ID of the user.
     *
     * @return a numeric array of associative arrays containing elements "name"
     * and "address".
     */
    public function getVendors(string $userID) {
        return $this->getCustomersOrVendors(FALSE, $userID);
    }
}
