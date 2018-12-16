<?php

/*
 * File: AuthenticationConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-15
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user authentication.
 */

require_once(__DIR__ . '/DatabaseConnection.php');

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

    /**
     * A method for getting the salted and hashed password of a user.
     *
     * @param $userID the userID of the desired user.
     *
     * @return the salted and hashed password of the user; NULL if no password
     * associated with userID exists or no user with userID exists.
     */
    public function getSaltedAndHashedPassword(string $userID) {
        // Query PasswordsDB.Passwords for the salted and hashed password of the
        // user.
        $getPasswordResult =
            $this->runQuery(
                'SELECT saltedAndHashedPassword '
                    . 'FROM PasswordsDB.Passwords '
                    . 'WHERE userID = ?',
                's',
                $userID);

        // If the above returns FALSE, an error occurred; throw an exception.
        if($getPasswordResult === FALSE) {
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');
        }

        // If the array returned above has no members, the user has no password,
        // so return NULL.
        if(count($getPasswordResult) == 0) {
            return NULL;
        }

        // If the array returned above has more than one member, multiple
        // passwords exist for the provided user, which should be illegal; throw
        // an exception.
        if(count($getPasswordResult) != 1) {
            throw new DatabaseException(
                'It appears that multiple passwords exist for the user '
                    . 'provided.');
        }

        // Return the salted and hashed password.
        return $getPasswordResult[0]['saltedAndHashedPassword'];
    }
}
