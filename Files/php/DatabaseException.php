<?php

/*
 * File: DatabaseException.php
 * Author(s): Matthew Dobson
 * Date modified: 11-23-2018
 * Description: Defines a PHP exception to be thrown by DatabaseConnection and
 * and its subclasses.
 */

class DatabaseException extends Exception {
    public function __construct(string $message) {
        parent::__construct();
    }
}
