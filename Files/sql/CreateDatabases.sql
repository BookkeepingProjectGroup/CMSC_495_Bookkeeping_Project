/*
 * File: CreateDatabases.sql
 * Author(s): Matthew Dobson
 * Date modified: 2018-11-6
 *
 * Description: A SQL script to setup the MariaDB SQL databases.
 *
 * Run this as user root.
 */

/*
 * A database in which to store a table associating users' IDs with their
 * usernames.
 */
CREATE DATABASE UsersDB;

/*
 * A table which associates the username of each user of the system with an ID.
 *
 * IMPORTANT: Users must not be able to view other users' usernames!
 */
CREATE TABLE UsersDB.Users(
    ID         INT         UNSIGNED NOT NULL,
    username   VARCHAR(64),
    PRIMARY KEY (ID)
);

/*
 * A database in which to store a table associating users' IDs with their salted
 * and hashed passwords.
 */
CREATE DATABASE PasswordsDB;

/*
 * A table which associates the salted and hashed password of each user and the
 * corresponding user's ID with a password ID.
 */
CREATE TABLE PasswordsDB.Passwords(
    ID                      INT          UNSIGNED NOT NULL,
    userID                  INT          UNSIGNED NOT NULL,
    saltedAndHashedPassword VARCHAR(256)          NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (userID) REFERENCES UsersDB.Users(ID)
);

/*
 * A database in which to store tables containing all of the application's
 * users' bookkeeping data.
 */
CREATE DATABASE BooksDB;

/*
 * A table which associates the information of each vendor (name, address) with
 * an ID and a user of the system.
 *
 * IMPORTANT: Users must not be able to view other users' vendors!
 */
CREATE TABLE BooksDB.Vendors(
    ID      INT          UNSIGNED NOT NULL,
    userID  INT          UNSIGNED NOT NULL,
    name    VARCHAR(32)           NOT NULL,
    address VARCHAR(128),
    PRIMARY KEY (ID),
    FOREIGN KEY (userID) REFERENCES UsersDB.Users(ID)
);

/*
 * A table which associates the information of each customer (name, address)
 * with an ID and a user of the system.
 *
 * IMPORTANT: Users must not be able to view other users' customers!
 */
CREATE TABLE BooksDB.Customers(
    ID      INT          UNSIGNED NOT NULL,
    userID  INT          UNSIGNED NOT NULL,
    name    VARCHAR(32)           NOT NULL,
    address VARCHAR(128),
    PRIMARY KEY (ID),
    FOREIGN KEY (userID) REFERENCES UsersDB.Users(ID)
);

/*
 * A table which associates the information of each document (vendor or customer
 * or neither, name, type [JE for journal entry, API for accounts payable
 * invoice, APD for accounts payable disbursement, ARI for accounts receivable
 * invoice or ARR for accounts receivable receipt], whether or not the document
 * has been posted) with an ID and a system user.
 *
 * IMPORTANT: Users must not be able to view other users' documents!
 */
CREATE TABLE BooksDB.Documents(
    ID         INT                                UNSIGNED NOT NULL,
    userID     INT                                UNSIGNED NOT NULL,
    vendorID   INT                                UNSIGNED,
    customerID INT                                UNSIGNED,
    name       VARCHAR(16),
    type       ENUM('JE','API','APD','ARI','ARR')          NOT NULL,
    isPosted   TINYINT(1)                         UNSIGNED NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (userID)     REFERENCES UsersDB.Users(ID),
    FOREIGN KEY (vendorID)   REFERENCES BooksDB.Vendors(ID),
    FOREIGN KEY (customerID) REFERENCES BooksDB.Customers(ID),
    CHECK ((vendorID IS NULL) OR (customerID IS NULL)),
    CHECK ((isPosted = 0) OR (isPosted = 1))
);

/*
 * A table which associates the information of an account (code [a four digit
 * number used by a user to refer to an account], name, type (ASSET, LIABILITY,
 * EQUITY, REVENUE or EXPENSE) with an ID and a user.
 *
 * IMPORTANT: Users must not be able to view other users' accounts!
 */
CREATE TABLE BooksDB.Accounts(
    ID        INT             UNSIGNED NOT NULL,
    userID    INT             UNSIGNED NOT NULL,
    code      SMALLINT(4)     UNSIGNED NOT NULL,
    name      VARCHAR(32),
    type      ENUM(
                  'ASSET',
                  'LIABILITY',
                  'EQUITY',
                  'REVENUE',
                  'EXPENSE')           NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (userID) REFERENCES UsersDB.Users(ID)
);

/*
 * A table which associates the information of each general ledger line
 * (account, date, debit amount or credit amount, description) with a user and a
 * document.
 *
 * IMPORTANT: Users must not be able to see other users' general ledger entries!
 *
 * (A userID field is not necessary here to determine with which user a row is
 * associated, as each line already contains a documentID and accountID, and
 * each document and account is associated with a user. Nonetheless, I figured
 * this would help to enforce the requirement that users be unable to see other
 * users' information, since a check can be in every query that userID refers to
 * the desired user.)
 */
CREATE TABLE BooksDB.GeneralLedger(
    ID          INT           UNSIGNED NOT NULL,
    userID      INT           UNSIGNED NOT NULL,
    documentID  INT           UNSIGNED NOT NULL,
    accountID   INT           UNSIGNED NOT NULL,
    lineDate    DATE                   NOT NULL,
    debit       DECIMAL(10,2),
    credit      DECIMAL(10,2),
    description VARCHAR(64),
    PRIMARY KEY (ID),
    FOREIGN KEY (userID)     REFERENCES UsersDB.Users(ID),
    FOREIGN KEY (documentID) REFERENCES BooksDB.Documents(ID),
    FOREIGN KEY (accountID)  REFERENCES BooksDB.Accounts(ID),
    CHECK (
        ((debit IS NULL) AND (credit IS NOT NULL))
        OR ((credit IS NULL) AND (debit IS NOT NULL)))
);

/*
 * The account the user administrator will use to setup and remove users; has
 * complete access to UsersDB and BooksDB.
 */
CREATE USER 'admin'@'localhost' IDENTIFIED BY '***INSERT PASSWORD HERE***';
GRANT ALL ON BooksDB.* TO 'admin'@'localhost';
GRANT ALL ON UsersDB.* TO 'admin'@'localhost';

/*
 * The account the password administrator (a program) will use to setup and
 * change users' passwords; has complete access to PasswordsDB and read-only
 * access to UsersDB.
 */
CREATE USER 'passwords'@'localhost' IDENTIFIED BY '***INSERT PASSWORD HERE***';
GRANT ALL ON PasswordsDB.* TO 'passwords'@'localhost';
GRANT SELECT ON UsersDB.* TO 'passwords'@'localhost';

/*
 * The account the password system will use to authenticate passwords; has read-
 * only access to PasswordsDB and UsersDB.
 */
CREATE USER 'authentication'@'localhost'
    IDENTIFIED BY '***INSERT PASSWORD HERE***';
GRANT SELECT ON PasswordsDB.* to 'authentication'@'localhost';
GRANT SELECT ON UsersDB.* to 'authentication'@'localhost';

/*
 * The account the Web app will use for manipulating bookkeeping data in
 * BooksDB; has complete access to BooksDB and read-only access to UsersDB.
 *
 * The password for this account must be stored in
 * /Files/config/phpLogon.json for PHP to get in.
 */
CREATE USER 'php'@'localhost' IDENTIFIED BY '***INSERT PASSWORD HERE***';
GRANT ALL ON BooksDB.* TO 'php'@'localhost';
GRANT SELECT ON UsersDB.* TO 'php'@'localhost';
