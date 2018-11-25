<?php

/*
 * File: PhpConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-24-2018
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
        // Query the database to see if the user already has a customer with the
        // given name.
        $customerAlreadyExistsResult =
            $this->runQuery(
                'SELECT ID from BooksDB.Customers '
                    . 'WHERE (userID = ?) AND (name = ?)',
                'ss',
                $userID,
                $name);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($customerAlreadyExistsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // If the query result does not have exactly 0 contents, the user
        // already has a customer with the given name, so return FALSE.
        if(count($customerAlreadyExistsResult) !== 0) return FALSE;

        // Insert the new customer into the database.
        $this->runQuery(
            'INSERT INTO BooksDB.Customers (userID, name, address) '
                . 'VALUES (?, ?, ?)',
            'sss',
            $userID,
            $name,
            $address);

        // If we made it here, everything must have gone well, so return TRUE.
        // (It is possible the insertion was unsuccessful, but no exceptions
        // were thrown by it; worst case the customer was not actually added to
        // the database.)
        return TRUE;
    }
}
