<?php

/*
 * File: DatabaseConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-8-2018
 * Description: Defines an abstract PHP class to represent, manipulate and
 * transmit a connection to the bookkeeper application's MariaDB SQL database.
 * Concrete classes extending this class will handle connections to the database
 * as specific users (authentication, passwords, php).
 */

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
    
