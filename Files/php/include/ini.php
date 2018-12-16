<?php

/*
 * File: ini.php
 * Author(s): Matthew Dobson
 * Last modified: 2018-12-15
 * Description: A PHP-file to be required by each of the end-points, it
 * configures php.ini settings as the application needs them to be set.
 */

// Make sure errors are not sent to the browser.
ini_set('display_errors', '0');

// Settings for secure sessions (see
// http://php.net/manual/en/session.security.ini.php).
ini_set('session.cookie_lifetime', '0');
ini_set('session.use_cookies', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1'); // Comment this line if not using HTTPS.
ini_set('session.gc_maxlifetime', '1440');
ini_set('session.use_trans_sid', '0');
ini_set('session.cache_limiter', 'nocache');
ini_set('session.sid_length', '48');
ini_set('session.sid_bits_per_character', '6');
ini_set('session.hash_function', 'sha256');

