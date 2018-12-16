<?php

/*
 * File: DuplicateException.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-04
 * Description: Defines an exception extending Exception to be thrown when an
 * identifier (e.g., a username) is already taken in the database.
 */

/**
 * An exception to be thrown when an identifier (e.g., a username) is already
 * taken in the database.
 */
class DuplicateException extends Exception {
}
