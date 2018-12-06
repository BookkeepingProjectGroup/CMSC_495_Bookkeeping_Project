<?php

/*
 * File: logout.php
 * Author(s): Matthew Dobson
 * Last modified: 2018-12-06
 * Description: An end-point for logging out. It destroys the PHP session.
 * Special thanks to PHP's manual for this logic (see
 * http://php.net/manual/en/function.session-destroy.php).
 */

// Start the session.
session_start();

// Erase any session variables set.
$_SESSION = array();

// Fetch the session cookie parameters.
$cookieParameters = session_get_cookie_params();

// Set the session cookie to blank.
setcookie(
    session_name(),
    '',
    time() - 42000,
    $cookieParameters['path'],
    $cookieParameters['domain'],
    $cookieParameters['secure'],
    $cookieParameters['httponly']);

// Destroy the session.
session_destroy();

