<?php

/*
 * File: UsersConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-15
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user users.
 */

require_once(__DIR__ . '/DatabaseConnection.php');

/** A class representing a connection MariaDB SQL database as user users. */
class UsersConnection extends DatabaseConnection {
    /** The username of user users. */
    const USER_USERS_USERNAME = 'users';

    /** The credentials file for user passwords. */
    const USER_USERS_CREDENTIALS_FILENAME = '../json/usersLogon.json';

    /**
     * The sole constructor to be used for this subclass.
     */
    public function __construct() {
        parent::__construct(
            self::USER_USERS_USERNAME,
            self::USER_USERS_CREDENTIALS_FILENAME);
    }

    /**
     * A method to add a user account.
     *
     * @param $username the username of the new account.
     *
     * @return the userID of the new user; NULL if the username already exists;
     * FALSE if some other error occurred.
     */
    public function addUser(string $username) {
        // If the new username is less than one character in length it is
        // invalid, so return FALSE.
        if(strlen($username) < 1) return FALSE;

        // Query the database for the given username; if that does not return
        // FALSE, a user already exists with that username, so return NULL.
        if($this->getUserID($username) !== FALSE) return NULL;

        // Insert the new user into the database.
        $this->runQuery(
            'INSERT INTO UsersDB.Users (username) VALUES (?)',
            's',
            $username);

        // Return the new user's userID.
        return $this->getUserID($username);
    }
}

