CREATE TABLE Users(
    ID     INT         UNSIGNED NOT NULL,
    name   VARCHAR(64),
    PRIMARY KEY (ID)
);

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

CREATE TABLE GeneralLedger(
    ID          INT           UNSIGNED NOT NULL,
    documentID  INT           UNSIGNED NOT NULL,
    accountID   INT           UNSIGNED NOT NULL,
    lineDate    DATE                   NOT NULL,
    debit       DECIMAL(10,2),
    credit      DECIMAL(10,2),
    description VARCHAR(64),
    PRIMARY KEY (ID),
    FOREIGN KEY (documentID) REFERENCES Documents(ID),
    FOREIGN KEY (accountID)  REFERENCES Accounts(ID),
    CHECK
        ((debit IS NULL) AND (credit IS NOT NULL))
        OR ((credit IS NULL) AND (debit IS NOT NULL))
);
