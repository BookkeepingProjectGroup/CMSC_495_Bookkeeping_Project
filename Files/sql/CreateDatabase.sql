CREATE TABLE Documents(
    documentID INT                                UNSIGNED NOT NULL,
    vendorID   INT                                UNSIGNED,
    customerID INT                                UNSIGNED,
    name       VARCHAR(16),
    type       ENUM('JE','API','APD','ARI','ARR')          NOT NULL,
    isPosted   TINYINT(1)                         UNSIGNED NOT NULL,
    PRIMARY KEY (documentID),
    FOREIGN KEY (vendorID)   REFERENCES Vendors(vendorID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(customerID),
    CHECK (vendorID IS NULL) OR (customerID IS NULL),
    CHECK (isPosted = 0) OR (isPosted = 1)
);

CREATE TABLE Accounts(
    accountID SMALLINT(4) UNSIGNED NOT NULL,
    name      VARCHAR(32),
    type      TINYINT(1)  UNSIGNED NOT NULL,
    PRIMARY KEY (accountID)
);

CREATE TABLE GeneralLedger(
    lineID      INT           UNSIGNED NOT NULL,
    documentID  INT           UNSIGNED NOT NULL,
    accountID   SMALLINT(4)   UNSIGNED NOT NULL,
    lineDate    DATE                   NOT NULL,
    debit       DECIMAL(10,2),
    credit      DECIMAL(10,2),
    description VARCHAR(64),
    PRIMARY KEY (lineID),
    FOREIGN KEY (documentID) REFERENCES Documents(documentID),
    FOREIGN KEY (accountID)  REFERENCES Accounts(accountID),
    CHECK
        ((debit IS NULL) AND (credit IS NOT NULL))
        OR ((credit IS NULL) AND (debit IS NOT NULL))
);
