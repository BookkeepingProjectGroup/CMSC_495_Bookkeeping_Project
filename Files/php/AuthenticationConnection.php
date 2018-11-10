<?php

/*
 * File: AuthenticationConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-8-2018
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user authentication.
 */

include 'DatabaseConnection.php';

/**
 * A class representing a connection MariaDB SQL database as user
 * authentication.
 */
class AuthenticationConnection extends DatabaseConnection {
    /** The username of user authentication. */
    const USER_AUTHENTICATION_USERNAME = 'authentication';

    /** The credentials file for user authentication. */
    const USER_AUTHENTICATION_CREDENTIALS_FILENAME =
        '../json/authenticationLogon.json';

    /**
     * The sole constructor to be used for this subclass.
     */
    public function __construct() {
        parent::__construct(
            self::USER_AUTHENTICATION_USERNAME,
            self::USER_AUTHENTICATION_CREDENTIALS_FILENAME);
    }
}
