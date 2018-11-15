<?php

/*
 * File: PhpConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-15-2018
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
}
