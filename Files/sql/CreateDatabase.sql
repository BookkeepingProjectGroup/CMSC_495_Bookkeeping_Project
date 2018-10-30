CREATE TABLE GeneralLedger(
    lineID      INT            UNSIGNED NOT NULL,
    documentID  INT            UNSIGNED NOT NULL,
    accountID   SMALLINT(4)    UNSIGNED NOT NULL,
    lineDate    DATE                    NOT NULL,
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

