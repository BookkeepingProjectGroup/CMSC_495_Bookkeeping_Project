/*
 * File: CreateDatabase.sql
 * Author(s): Matthew Dobson
 * Date modified: 2018-11-3
 *
 * Description: A SQL script to setup the MariaDB database for the application.
 * Run this script as root before CreateTables.sql.
 */

CREATE DATABASE BooksDB;

-- The password used here will need to be stored in a config file somewhere for
-- the PHP application.
CREATE USER 'php'@'localhost' IDENTIFIED BY '***INSERT PASSWORD HERE***';

GRANT ALL ON BooksDB.* TO 'php'@'localhost';

FLUSH PRIVILEGES;
