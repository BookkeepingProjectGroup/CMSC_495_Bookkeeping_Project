<?php

/*
 * File: AuthenticationConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-10-2018
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

    /**
     * A method for getting the salted and hashed password of a user.
     *
     * @param $username the username of the desired user.
     *
     * @return the salted and hashed password of the user; NULL if the user
     * exists but has no password set; FALSE if the user does not exist.
     */
    public function getSaltedAndHashedPassword(string $username) {
        // Query UsersDB.Users to get the ID associated with $username.
        $getUserIDResult =
            $this->runQuery(
                'SELECT ID FROM UsersDB.Users WHERE username = ?',
                's',
                $username);

        // If the array returned above has no members, the user does not exist,
        // so return FALSE.
        if(count($getUserIDResult) == 0) {
            return FALSE;
        }

        // If the array returned above has more than one member, multiple users
        // exist with the provided username, which should be illegal; throw an
        // exception.
        if(count($getUserIDResult) != 1) {
            throw new DatabaseException(
                'It appears that multiple users exist with the username '
                    . 'provided.');
        }

        // Query PasswordsDB.Passwords for the salted and hashed password of the
        // user.
        $getPasswordResult =
            $this->runQuery(
                'SELECT saltedAndHashedPassword '
                    . 'FROM PasswordsDB.Passwords '
                    .'WHERE userID = ?',
                's',
                $getUserIDResult[0][0]);

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
        return $getPasswordResult[0][0];
    }
}
