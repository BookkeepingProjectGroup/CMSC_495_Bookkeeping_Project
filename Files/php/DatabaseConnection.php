<?php

/*
 * File: DatabaseConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-10-2018
 * Description: Defines an abstract PHP class to represent, manipulate and
 * transmit a connection to the bookkeeper application's MariaDB SQL database.
 * Concrete classes extending this class will handle connections to the database
 * as specific users (authentication, passwords, php).
 */

include 'DatabaseException.php';

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
     * A method to run a prepared SQL statement.
     *
     * @param $SQLStatement the SQL statement to run, with "?" in place of
     * parameters.
     * @param $parameterTypes a string containing the types of the parameters in
     * the order in which they appear ("i" for an integer, "d" for a double, "s"
     * for a string, "b" for a blob).
     * @param ...$parameters the parameters.
     *
     * @return an array of arrays containing the result of the query.
     */
    protected function runQuery(
        string $SQLStatement,
        string $parameterTypes,
        ...$parameters) {
        // These need to be visible in both the try and finally blocks below.
        $statement = NULL;
        $result = NULL;

        // This needs to be visible throughout this method.
        $resultArray = NULL;

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

            // Get the result of the statment.
            $result = $statement->get_result();

            // If the above returned FALSE, an error occurred; throw an
            // exception if that is the case.
            if(!$result) {
                throw new DatabaseException(
                    'mysqli_stmt::get_result(void) failed.');
            }

            // Extract an array of arrays from the result.
            $resultArray = $result->fetch_all();
        } finally {
            // Make sure the statement and result are closed and freed.
            $statement->close();
            $result->free();
        }

        // Return the array of arrays.
        return $resultArray;
    }
}
