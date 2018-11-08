<?php

/*
 * File: PasswordsConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-8-2018
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user passwords.
 */

include 'DatabaseConnection.php';

/** A class representing a connection MariaDB SQL database as user passwords. */
class PasswordsConnection extends DatabaseConnection {
    /** The username of user passwords. */
    const USER_PASSWORDS_USERNAME = 'passwords';

    /** The credentials file for user passwords. */
    const USER_PASSWORDS_CREDENTIALS_FILENAME = '../json/passwordsLogon.json';

    /**
     * The sole constructor to be used for this subclass.
     */
    public function __construct() {
        parent::__construct(
            self::USER_PASSWORDS_USERNAME,
            self::USER_PASSWORDS_CREDENTIALS_FILENAME);
    }
}
