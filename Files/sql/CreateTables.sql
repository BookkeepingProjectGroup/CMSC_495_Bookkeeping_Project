/*
 * File: CreateTables.sql
 * Author(s): Matthew Dobson
 * Date modified: 2018-11-3
 *
 * Description: A SQL script to setup the MariaDB database for the Bookkeepper
 * application. Run this script as user php@localhost.
 */

/*
 * A table which associates the username of each user of the system with an ID.
 *
 * IMPORTANT: Users must not be able to view other users' usernames!
 */
CREATE TABLE Users(
    ID         INT         UNSIGNED NOT NULL,
    username   VARCHAR(64),
    PRIMARY KEY (ID)
);

/*
 * A table which associates the information of each vendor (name, address) with
 * an ID and a user of the system.
 *
 * IMPORTANT: Users must not be able to view other users' vendors!
 */
CREATE TABLE Vendors(
    ID      INT          UNSIGNED NOT NULL,
    userID  INT          UNSIGNED NOT NULL,
    name    VARCHAR(32)           NOT NULL,
    address VARCHAR(128),
    PRIMARY KEY (ID),
    FOREIGN KEY (userID) REFERENCES Users(ID)
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
CREATE TABLE Documents(
    ID         INT                                UNSIGNED NOT NULL,
    userID     INT                                UNSIGNED NOT NULL,
    vendorID   INT                                UNSIGNED,
    customerID INT                                UNSIGNED,
    name       VARCHAR(16),
    type       ENUM('JE','API','APD','ARI','ARR')          NOT NULL,
    isPosted   TINYINT(1)                         UNSIGNED NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (userID)     REFERENCES Users(ID),
    FOREIGN KEY (vendorID)   REFERENCES Vendors(ID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(ID),
    CHECK (vendorID IS NULL) OR (customerID IS NULL),
    CHECK (isPosted = 0) OR (isPosted = 1)
);

/*
 * A table which associates the information of an account (code [a four digit
 * number used by a user to refer to an account], name, type (ASSET, LIABILITY,
 * EQUITY, REVENUE or EXPENSE) with an ID and a user.
 *
 * IMPORTANT: Users must not be able to view other users' accounts!
 */
CREATE TABLE Accounts(
    ID        INT             UNSIGNED NOT NULL,
    userID    INT             UNSIGNED NOT NULL,
    code      SMALLINT(4)     UNSIGNED NOT NULL,
    name      VARCHAR(32),
    type      ENUM(
                  'ASSET',
                  'LIABILITY',
                  'EQUITY',
                  'REVENUE',
                  'EXPENSE')  UNSIGNED NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (userID) REFERENCES Users(ID)
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
CREATE TABLE GeneralLedger(
    ID          INT           UNSIGNED NOT NULL,
    userID      INT           UNSIGNED NOT NULL,
    documentID  INT           UNSIGNED NOT NULL,
    accountID   INT           UNSIGNED NOT NULL,
    lineDate    DATE                   NOT NULL,
    debit       DECIMAL(10,2),
    credit      DECIMAL(10,2),
    description VARCHAR(64),
    PRIMARY KEY (ID),
    FOREIGN KEY (userID)     REFERENCES Users(ID),
    FOREIGN KEY (documentID) REFERENCES Documents(ID),
    FOREIGN KEY (accountID)  REFERENCES Accounts(ID),
    CHECK
        ((debit IS NULL) AND (credit IS NOT NULL))
        OR ((credit IS NULL) AND (debit IS NOT NULL))
);
