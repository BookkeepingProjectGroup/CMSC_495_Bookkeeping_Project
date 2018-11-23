<?php

/*
 * File: DatabaseConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-21-2018
 * Description: Defines an abstract PHP class to represent, manipulate and
 * transmit a connection to the bookkeeper application's MariaDB SQL database.
 * Concrete classes extending this class will handle connections to the database
 * as specific users (authentication, passwords, php).
 */

include_once 'DatabaseException.php';

/**
 * A class representing a connection MariaDB SQL database containing the schema
 * for bookkeeping.
 */
abstract class DatabaseConnection {
    /** The mysqli connection object used by this class. */
    protected $SQLDatabase;

    /**
     * The sole constructor; to be used only by subclasses of this class.
     *
     * @param $username the username with which to login.
     * @param $JSONDatabaseCredentialsFilename the filename, including path, of
     * the database credentials file.
     */
    protected function __construct(
        string $username, string $JSONDatabaseCredentialsFilename) {
        // Parse the contents of the JSON database credentials file.
        $databaseCredentials =
            json_decode(
                file_get_contents(
                    $JSONDatabaseCredentialsFilename, FALSE, NULL, 0, 256));

        // Make sure the json decode worked; if not, throw an exception
        if(
            ($databaseCredentials === NULL)
            || ($databaseCredentials->host === NULL)
            || ($databaseCredentials->username === NULL)
            || ($databaseCredentials->password === NULL)) {
            throw new Exception(
                'An error occurred with the database credentials file.');
        }

        // Make sure the username in the credentials file matches the username
        // provided; if not, throw an exception
        if($username !== $databaseCredentials->username) {
            throw new Exception('Wrong database credentials filename given.');
        }

        // Create a mysqli connection.
        $this->SQLDatabase =
            new mysqli(
                $databaseCredentials->host,
                $username,
                $databaseCredentials->password);

        // Make sure there was no connect_error; if there was, throw an
        // exception.
        if($this->SQLDatabase->connect_error) {
            throw new Exception(
                'There was an error connecting to MariaDB: '
                . $this->SQLDatabase->connect_error);
        }
    }

    /** The destructor; it ensures this connection has been closed. */
    public function __destruct() {
        $this->close();
    }

    /** A method to close this connection. */
    public function close() {
        $this->SQLDatabase->close();
    }

    /**
     * A method to get the userID associated with a username; it works from any
     * database user which has access to UsersDB, which at this time includes
     * all of the ones to which this class is meant to facilitate access
     * (authentication, passwords and php).
     *
     * @param $username the username of the user.
     *
     * @return the userID, or FALSE if no user exists with username $username.
     */
    public function getUserID(string $username) {
        // Query UsersDB.Users to get the ID associated with $username.
        $getUserIDResult =
            $this->runQuery(
                'SELECT ID FROM UsersDB.Users WHERE username = ?',
                's',
                $username);

        // If the above returns FALSE, an error occurred; throw an exception.
        if($getUserIDResult === FALSE) {
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');
        }

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

        // Return just the userID.
        return $getUserIDResult[0]['ID'];
    }

    /**
     * A method to run a prepared SQL statement.
     *
     * @param $SQLStatement the SQL statement to run, with "?" in place of
     * parameters.
     * @param $parameterTypes a string containing the types of the parameters in
     * the order in which they appear ("i" for an integer, "d" for a double, "s"
     * for a string, "b" for a blob).
     * @param ...$parameters the parameters.
     *
     * @return an array of associative arrays containing the result of the
     * query; FALSE if a non-SELECT statement was issued or a SELECT statement
     * was issued and the result could not be obtained.
     */
    protected function runQuery(
        string $SQLStatement,
        string $parameterTypes,
        ...$parameters) {
        // These need to be visible in both the try and finally blocks below.
        $statement = NULL;
        $result = NULL;

        // This needs to be visible throughout this method.
        $resultArrayOrFalse = FALSE;

        try {
            // Have mysqli prepare the statement.
            $statement = $this->SQLDatabase->prepare($SQLStatement);

            // If the above returned FALSE, an error occurred; throw an
            // exception if that is the case.
            if(!$statement) {
                throw new DatabaseException('mysqli::prepare(string) failed.');
            }

            // Bind the parameters to the statement; if that returns FALSE, an
            // error occurred; throw an exception if that is the case.
            if(!$statement->bind_param($parameterTypes, ...$parameters)) {
                throw new DatabaseException(
                    'mysqli_stmt::bind_param(string,mixed...) failed.');
            }

            // Execute the statement; if that returns FALSE, an error occurred;
            // throw an exception if that is the case.
            if(!$statement->execute()) {
                throw new DatabaseException(
                    'mysqli_stmt::execute(void) failed.');
            }

            // Get the result of the statement.
            $result = $statement->get_result();

            // The above returns FALSE if there is an error in a SELECT
            // statement or if any other type of statement is used; only extract
            // an array of arrays from the result if it is not FALSE.
            if($result) {
                $resultArrayOrFalse = $result->fetch_all(MYSQLI_ASSOC);
            }
        } finally {
            // Make sure the statement and result are closed and freed.
            if($statement) {
                $statement->close();
            }

            if($result) {
                $result->free();
            }
        }

        // Return the array of arrays.
        return $resultArrayOrFalse;
    }
}
