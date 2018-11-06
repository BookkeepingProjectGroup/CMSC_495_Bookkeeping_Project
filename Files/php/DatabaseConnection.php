<?php

/*
 * File: DatabaseConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 11-6-2018
 * Description: Defines a PHP class to represent, manipulate and transmit a
 * connection to the bookkeeper application's MariaDB SQL database.
 */

/**
 * A class representing a connection MariaDB SQL database containing the schema
 * for bookkeeping.
 */
class DatabaseConnection {
    /** The mysqli connection object used by this class. */
    private $SQLDatabase;

    /**
     * The sole constructor.
     *
     * @param $JSONDatabaseConfigFilename the filename, including path, of the
     * database config file.
     */
    public function __construct(string $JSONDatabaseConfigFilename) {
        // Parse the contents of the JSON database config file.
        $databaseConfigInfo =
            json_decode(
                file_get_contents(
                    $JSONDatabaseConfigFilename, FALSE, NULL, 0, 256));

        // Create a mysqli connection.
        $this->SQLDatabase =
            new mysqli(
                $databaseConfigInfo->host,
                $databaseConfigInfo->username,
                $databaseConfigInfo->password,
                $databaseConfigInfo->database);
    }

    /** The destructor; it ensures this connection has been closed. */
    public function __destruct() {
        $this->close();
    }

    /** A method to close this connection. */
    public function close() {
        $this->SQLDatabase->close();
    }
}
