<?php

/*
 * File: PasswordsConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-15
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user passwords.
 */

require_once(__DIR__ . '/DatabaseConnection.php');

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

    /**
     * A method to set or reset a user's password. The password is salted and
     * hashed using PHP's password_hash() method. If the user already has a
     * password in the database, the user's password will be changed.
     *
     * @param $userID the ID of the user whose password is to be set or changed.
     * @param $password the new password.
     *
     * @return TRUE if everything went correctly; FALSE if the password was not
     * changed.
     */
    public function setUserPassword(string $userID, string $password) {
        // Salt and has the password.
        $saltedAndHashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Query to see if the user has a password on record.
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

        // Branch depending on the number of items resulting from the query.
        if(count($getPasswordResult) == 0) {
            // If there is no password set for the user, user INSERT to add the
            // user and the password to the database.
            $this->runQuery(
                'INSERT INTO PasswordsDB.Passwords '
                    . '(userID, saltedAndHashedPassword) '
                    . 'VALUES (?, ?)',
                'ss',
                $userID,
                $saltedAndHashedPassword);
        } elseif(count($getPasswordResult) == 1) {
            // If there is a password on file for the user, use UPDATE to update
            // it to the new password.
            $this->runQuery(
                'UPDATE PasswordsDB.Passwords '
                    . 'SET saltedAndHashedPassword = ? '
                    . 'WHERE userID = ?',
                'ss',
                $saltedAndHashedPassword,
                $userID);
        } else {
            // If the query produced more than one result, it appears the user
            // has more than one password, and this should be an illegal
            // situation; throw an exception.
            throw new DatabaseException(
                'It appears multiple passwords exist for the user provided.');
        }

        // In order to ensure the password was successfully changed, query the
        // database for the new password.
        $getUpdatedPasswordResult =
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

        // If the queried password does not equal what it should, return 0.
        if(
            $getUpdatedPasswordResult[0]['saltedAndHashedPassword'] !=
                $saltedAndHashedPassword) {
            return 0;
        }

        // If we made it here, everything must have gone well, so return TRUE.
        return TRUE;
    }
}
