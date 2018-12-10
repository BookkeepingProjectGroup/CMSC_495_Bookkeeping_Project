<?php

/*
 * File: PhpConnection.php
 * Author(s): Matthew Dobson
 * Date modified: 2018-12-08
 *
 * Description: Defines a concrete PHP class extending abstract class
 * DatabaseConnection to represent, manipulate and transmit a connection to the
 * MariaDB SQL database through user php.
 */

require_once 'DatabaseConnection.php';

/** A class representing a connection MariaDB SQL database as user php. */
class PhpConnection extends DatabaseConnection {
    /** The username of user php. */
    const USER_PHP_USERNAME = 'php';

    /** The credentials file for user php. */
    const USER_PHP_CREDENTIALS_FILENAME = '../json/phpLogon.json';

    /** The default accounts file. */
    const DEFAULT_ACCOUNTS_FILENAME = '../json/defaultAccounts.json';

    /**
     * addDocument(string,string,string,array[,string[,string]]) error codes.
     */
    const ADDDOCUMENT_ERROR_NO_ERROR = 0;
    const ADDDOCUMENT_ERROR_DOCUMENT_ALREADY_EXISTS = 1;
    const ADDDOCUMENT_ERROR_CUSTOMER_OR_VENDOR_FIELD_MISMATCH = 2;
    const ADDDOCUMENT_ERROR_CUSTOMER_OR_VENDOR_NONEXISTENT = 3;
    const ADDDOCUMENT_ERROR_INVALID_DOCUMENT_TYPE = 4;
    const ADDDOCUMENT_ERROR_ACCOUNT_NONEXISTENT = 5;
    const ADDDOCUMENT_ERROR_INVALID_DATE = 6;
    const ADDDOCUMENT_ERROR_MISSING_DEBIT_OR_CREDIT_FIELD = 7;
    const ADDDOCUMENT_ERROR_DAILY_DEBITS_AND_CREDITS_MISMATCH = 8;
    const ADDDOCUMENT_ERROR_DATABASE_MALFUNCTION = 9;

    /**
     * The sole constructor to be used for this subclass.
     */
    public function __construct() {
        parent::__construct(
            self::USER_PHP_USERNAME, self::USER_PHP_CREDENTIALS_FILENAME);
    }

    /**
     * A method to add an account to the database.
     *
     * @param $userID the ID of the user with which the new account is to be
     * associated.
     * @param $code the four-digit code the the new account; each user may have
     * at most only one account with each possible code.
     * @param $name the name of the new account.
     * @param $type the type of the new account; must be one of "ASSET",
     * "LIABILITY", "EQUITY", "REVENUE" or "EXPENSE".
     *
     * @returns TRUE if the new account was successfully added; NULL if the user
     * already had an account with the given code; FALSE otherwise.
     */
    public function addAccount(
        string $userID,
        string $code,
        string $name,
        string $type
    ) {
        // Query the database for any currently existing accounts belonging to
        // the given user and having the given code.
        $accountAlreadyExistsID = $this->runQuery(
            'SELECT ID FROM BooksDB.Accounts WHERE (userID = ?) AND (code = ?)',
            'ss',
            $userID,
            $code
        );

        // If DatabaseConnection::runQuery(string,string,...mixed) returns false
        // for a SELECT statement, an error occurred, so throw a
        // DatabaseException.
        if($accountAlreadyExistsID === FALSE) {
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.'
            );
        }

        // Count the number of account IDs returned by the query.
        $accountAlreadyExistsIDCount = count($accountAlreadyExistsID);

        // If any account IDs were returned, this user already has one or more
        // accounts with the given code, so return NULL.
        if($accountAlreadyExistsIDCount > 0) {
            return NULL;
        }

        // Insert the new account into the database.
        $this->runQuery(
            'INSERT INTO BooksDB.Accounts (userID, code, name, type) '
                . 'VALUES (?, ?, ?, ?)',
            'ssss',
            $userID,
            $code,
            $name,
            $type
        );

        // Query the database to see if it was added successfully.
        $newAccountID = $this->runQuery(
            'SELECT ID FROM BooksDB.Accounts WHERE (userID = ?) AND (code = ?)',
            'ss',
            $userID,
            $code
        );

        // If DatabaseConnection::runQuery(string,string,...mixed) returns false
        // for a SELECT statement, an error occurred, so throw a
        // DatabaseException.
        if($newAccountID === FALSE) {
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.'
            );
        }

        // If there are not more account IDs in the database now than when we
        // started, the account was not added successfully, so throw a
        // DatabaseException.
        if(count($newAccountID) <= $accountAlreadyExistsIDCount) {
            throw new DatabaseException('A new account could not be added.');
        }

        // If we make it here, the new account was added successfully, so return
        // TRUE.
        return TRUE;
    }

    /**
     * A method to add a customer to the database.
     *
     * @param $userID the ID of the user with whom this customer is associated.
     * @param $name the name of the customer.demolition ranch
     * @param $address the address of the customer.
     *
     * @return TRUE if the customer was added successfully; FALSE if the user
     * already has a customer by that name.
     */
    public function addCustomer(string $userID, string $name, string $address) {
        return $this->addCustomerOrVendor(TRUE, $userID, $name, $address);
    }

    /**
     * A method for adding a group of default accounts to the database for a
     * specified user.
     *
     * If any of the default accounts' codes have already been taken in the
     * user's database, they are skipped. The path to the file containing the
     * information of the default accounts is in
     * self::DEFAULT_ACCOUNTS_FILENAME.
     *
     * @param $userID the ID of the user for which the accounts are to be added.
     *
     * @return an array of associative arrays containing the "code", "name" and
     * "type" of each account added.
     */
    public function addDefaultAccounts(string $userID) {
        return array_filter(
            array_map(
                function(array $defaultAccount) use ($userID) {
                    $outputKeys = array(
                        'code' => NULL,
                        'name' => NULL,
                        'type' => NULL
                    );

                    return(
                        $this->addAccount(
                            $userID,
                            $defaultAccount['code'],
                            $defaultAccount['name'],
                            $defaultAccount['type']
                        )
                        ? array_intersect_key($defaultAccount, $outputKeys)
                        : array()
                    );
                },
                json_decode(
                    file_get_contents(
                        self::DEFAULT_ACCOUNTS_FILENAME,
                        FALSE,
                        NULL,
                        0,
                        1024
                    ),
                    TRUE,
                    3
                )
            )
        );
    }

    /**
     * A method to add a document with its general ledger rows to the database.
     *
     * @param $userID the ID of the user with which the document is associated.
     * @param $documentName the name of the document.
     * @param $type the type of the document.
     * @param $generalLedgerRows a numeric array of generalLedgerRows; each must
     * be an associative array containing parameters "code", as in account code;
     * "date"; "isDebit"; "debit" or "credit"; and "description".
     * @param $customerName the name of the customer if $type is "ARI" or "ARR".
     * @param $vendorName the name of the vendor if $type is "API" or "APD".
     *
     * @return see the error code constants in this class.
     */
    public function addDocument(
        string $userID,
        string $documentName,
        string $type,
        array $generalLedgerRows,
        string $customerName = NULL,
        string $vendorName = NULL) {
        // See if the user already has a document with this name.
        $documentAlreadyExistsResult =
            $this->runQuery(
                'SELECT ID FROM BooksDB.Documents '
                    . 'WHERE (userID = ?) AND (name = ?)',
                'ss',
                $userID,
                $documentName);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($documentAlreadyExistsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // If the above returns anything more than 0, the user already has a
        // a document by the name given, so return the corresponding error code.
        if(count($documentAlreadyExistsResult) !== 0)
            return self::ADDDOCUMENT_ERROR_DOCUMENT_ALREADY_EXISTS;

        // These need to be visible inside and outside the if block below.
        $customerID = NULL;
        $vendorID = NULL;

        if((strcmp($type, 'ARI') === 0) || (strcmp($type, 'ARR') === 0)) {
            // If the document type is accounts receivable ...

            // Make sure a customer name has been provided; if not, return the
            // corresponding error code.
            if(!$customerName)
                return
                    self::ADDDOCUMENT_ERROR_CUSTOMER_OR_VENDOR_FIELD_MISMATCH;

            // Query the database for the ID of the customer specified by userID
            // and customer name.
            $getCustomerIDResult =
                $this->runQuery(
                    'SELECT ID FROM BooksDB.Customers '
                        . 'WHERE (userID = ?) AND (name = ?)',
                    'ss',
                    $userID,
                    $customerName);

            // If DatabaseConnection::runQuery(string,string,...mixed) returns
            // FALSE, an error occurred, so throw an exception.
            if($getCustomerIDResult === FALSE)
                throw new DatabaseException(
                    'DatabaseConnection::runQuery(string,string,...mixed) '
                        . 'failed.');

            // Set our local customerID variable to the one returned from the
            // database.
            $customerID = $getCustomerIDResult[0]['ID'];

            // If customerID is still NULL, the customer does not exist, so
            // return the corresponding error code.
            if(!$customerID)
                return self::ADDDOCUMENT_ERROR_CUSTOMER_OR_VENDOR_NONEXISTENT;
        } elseif((strcmp($type, 'API') === 0) || (strcmp($type, 'APD') === 0)) {
            // If the document type is accounts payable ...

            // Make sure a vendor name has been provided; if not, return the
            // corresponding error code.
            if(!$vendorName)
                return
                    self::ADDDOCUMENT_ERROR_CUSTOMER_OR_VENDOR_FIELD_MISMATCH;

            // Query the database for the ID of the vendor specified by userID
            // and vendor name.
            $getVendorIDResult =
                $this->runQuery(
                    'SELECT ID FROM BooksDB.Vendors '
                        . 'WHERE (userID = ?) AND (name = ?)',
                    'ss',
                    $userID,
                    $vendorName);

            // If DatabaseConnection::runQuery(string,string,...mixed) returns
            // FALSE, an error occurred, so throw an exception.
            if($getVendorIDResult === FALSE)
                throw new DatabaseException(
                    'DatabaseConnection::runQuery(string,string,...mixed) '
                        . 'failed.');

            // Set our local vendorID variable to the one returned from the
            // database.
            $vendorID = $getVendorIDResult[0]['ID'];

            // If vendorID is still NULL, the vendor does not exist, so return
            // the corresponding error code.
            if(!$vendorID)
                return self::ADDDOCUMENT_ERROR_CUSTOMER_OR_VENDOR_NONEXISTENT;
        } elseif(strcmp($type, 'JE') !== 0) {
            // If the document type is not any of the valid types, return the
            // corresponding error code.
            return self::ADDDOCUMENT_ERROR_INVALID_DOCUMENT_TYPE;
        }

        // Initialize an array in which to store prepared general ledger rows as
        // they are produced below.
        $preparedGeneralLedgerRows = array();

        foreach($generalLedgerRows as $generalLedgerRow) {
            // For each general ledger row provided ...

            // Query the database for the ID of the account specified by userID
            // and account code.
            $getAccountIDResult =
                $this->runQuery(
                    'SELECT ID FROM BooksDB.Accounts '
                        . 'WHERE (userID = ?) AND (code = ?)',
                    'ss',
                    $userID,
                    $generalLedgerRow['code']);

            // If DatabaseConnection::runQuery(string,string,...mixed) returns
            // FALSE, an error occurred, so throw an exception.
            if($getAccountIDResult === FALSE)
                throw new DatabaseException(
                    'DatabaseConnection::runQuery(string,string,...mixed) '
                        . 'failed.');

            // Set our local accountID variable to the one returned from the
            // database.
            $accountID = $getAccountIDResult[0]['ID'];

            // If accountID is NULL, the account does not exist, so return the
            // corresponding error code.
            if(!$accountID) return self::ADDDOCUMENT_ERROR_ACCOUNT_NONEXISTENT;

            // Reformat the date so it is in the format the database expects.
            $date = date('Y-m-d', strtotime($generalLedgerRow['date']));

            // If date(string[,int]) returned FALSE, the date could not be
            // reformatted, so return the corresponding error code.
            if(!$date) return self::ADDDOCUMENT_ERROR_INVALID_DATE;

            // These need to be visible both inside and outside the if block
            // below.
            $debit = NULL;
            $credit = NULL;

            if($generalLedgerRow['isDebit']) {
                // If this is a debit row ...

                // Fetch the debit value from the row.
                $debit = $generalLedgerRow['debit'];

                // If debit is still NULL, no debit was provided, so return the
                // corresponding error code.
                if(!$debit)
                    return
                        self::ADDDOCUMENT_ERROR_MISSING_DEBIT_OR_CREDIT_FIELD;
            } else {
                // If this is a credit row ...

                // Fetch the credit value from the row.
                $credit = $generalLedgerRow['credit'];

                // If credit is still NULL, no credit was provided, so return
                // the corresponding error code.
                if(!$credit)
                    return
                        self::ADDDOCUMENT_ERROR_MISSING_DEBIT_OR_CREDIT_FIELD;
            }

            // Append the cleaned-up and checked values to the array of prepared
            // general ledger rows.
            $preparedGeneralLedgerRows[] =
                array(
                    'accountID' => $accountID,
                    'lineDate' => $date,
                    'debit' => $debit,
                    'credit' => $credit,
                    'description' => $generalLedgerRow['description']);
        }

        // Initialize an array in which to store daily debit and credit totals.
        $dailyDebitAndCreditTotals = array();

        foreach($preparedGeneralLedgerRows as $preparedGeneralLedgerRow) {
            // For each prepared general ledger row ...

            // Fetch the line date from the row.
            $lineDate = $preparedGeneralLedgerRow['lineDate'];

            // If the date has not yet been added to the daily debit and credit
            // totals array, add it, initializing the total debits and credits
            // to 0 each.
            if(!array_key_exists($lineDate, $dailyDebitAndCreditTotals))
                $dailyDebitAndCreditTotals[$lineDate] =
                    array('debit' => '0', 'credit' => '0');

            // Fetch the debit amount from the row.
            $debit = $preparedGeneralLedgerRow['debit'];

            // If the debit amount is not NULL, add it to the total debits for
            // this date in the daily debit and credit totals array; if debit is
            // NULL, add the credit amount to the credits total.
            if($debit) {
                $dailyDebitAndCreditTotals[$lineDate]['debit'] =
                    bcadd(
                        $dailyDebitAndCreditTotals[$lineDate]['debit'],
                        $debit);
            } else {
                $dailyDebitAndCreditTotals[$lineDate]['credit'] =
                    bcadd(
                        $dailyDebitAndCreditTotals[$lineDate]['credit'],
                        $preparedGeneralLedgerRow['credit']);
            }
        }

        // For each date in the daily debit and credit totals array, check that
        // debits equal credits; if this is not true, return the corresponding
        // error code.
        foreach($dailyDebitAndCreditTotals as $dailyDebitAndCreditTotal) {
            if(
                strcmp(
                    $dailyDebitAndCreditTotal['debit'],
                    $dailyDebitAndCreditTotal['credit'])
                !== 0) 
                return
                    self::ADDDOCUMENT_ERROR_DAILY_DEBITS_AND_CREDITS_MISMATCH;
        }

        // Insert the new document into the database.
        $this->runQuery(
            'INSERT INTO BooksDB.Documents '
                . '(userID, customerID, vendorID, name, type, isPosted) '
                . 'VALUES (?, ?, ?, ?, ?, 0)',
            'sssss',
            $userID,
            $customerID,
            $vendorID,
            $documentName,
            $type);

        // Query the database for the new document's ID.
        $getDocumentIDResult =
            $this->runQuery(
                'SELECT ID FROM BooksDB.Documents '
                    . 'WHERE (userID = ?) AND (name = ?)',
                'ss',
                $userID,
                $documentName);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($getDocumentIDResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // If the result of the above contains no rows, an error occurred, so
        // throw an exception.
        if(count($getDocumentIDResult) < 1)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // Fetch the new document ID from the query result.
        $documentID = $getDocumentIDResult[0]['ID'];

        // If documentID is NULL, an error occurred, so throw a
        // DatabaseException.
        if(!$documentID)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // Insert each prepared general ledger row into the database.
        foreach($preparedGeneralLedgerRows as $preparedGeneralLedgerRow) {
            $this->runQuery(
                'INSERT INTO BooksDB.GeneralLedger ('
                        . 'userID, '
                        . 'documentID, '
                        . 'accountID, '
                        . 'lineDate, '
                        . 'debit, '
                        . 'credit, '
                        . 'description) '
                    . 'VALUES (?, ?, ?, ?, ?, ?, ?)',
                'sssssss',
                $userID,
                $documentID,
                $preparedGeneralLedgerRow['accountID'],
                $preparedGeneralLedgerRow['lineDate'],
                $preparedGeneralLedgerRow['debit'],
                $preparedGeneralLedgerRow['credit'],
                $preparedGeneralLedgerRow['description']);
        }

        // Query the database for the IDs of the new general ledger rows just
        // added.
        $getEnteredGeneralLedgerRowsResult =
            $this->runQuery(
                'SELECT ID FROM BooksDB.GeneralLedger '
                    . 'WHERE (userID = ?) AND (documentID = ?)',
                'ss',
                $userID,
                $documentID);

        // If DatabaseConnection::runQuery(string,string,...mixed) returned
        // FALSE an error occurred, so throw an exception.
        if($getEnteredGeneralLedgerRowsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // If the count of rows actually entered does not equal the count of
        // rows which should have been entered, delete any new rows that made it
        // into the database, delete the new document from the database and
        // return the corresponding error code.
        if(
            count($getEnteredGeneralLedgerRowsResult)
            !== count($preparedGeneralLedgerRows)) {
            $this->runQuery(
                'DELETE FROM BooksDB.GeneralLedger '
                    . 'WHERE (userID = ?) AND (documentID = ?)',
                'ss',
                $userID,
                $documentID);

            $this->runQuery(
                'DELETE FROM BooksDB.Documents WHERE (userID = ?) AND (ID = ?)',
                'ss',
                $userID,
                $documentID);

            return self::ADDDOCUMENT_ERROR_DATABASE_MALFUNCTION;
        }

        // Return the error code for no error.
        return self::ADDDOCUMENT_ERROR_NO_ERROR;
    }

    /**
     * A method to add a customer or vendor to the database.
     *
     * @param $isCustomer TRUE to add a customer, FALSE to add a vendor.
     * @param $userID the ID of the user with whom this customer or vendor is
     * associated.
     * @param $name the name of the customer or vendor.
     * @param $address the address of the customer or vendor.
     *
     * @return TRUE if the customer or vendor was added successfully; FALSE if
     * the user already has a customer/vendor by that name.
     */
    private function addCustomerOrVendor(
        bool $isCustomer,
        string $userID,
        string $name,
        string $address) {
        // Query the database to see if the user already has a customer/vendor
        // with the given name.
        $customerOrVendorAlreadyExistsResult =
            $this->runQuery(
                'SELECT ID FROM BooksDB.' 
                    . ($isCustomer ? 'Customers' : 'Vendors')
                    . ' WHERE (userID = ?) AND (name = ?)',
                'ss',
                $userID,
                $name);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($customerOrVendorAlreadyExistsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // If the query result does not have exactly 0 contents, the user
        // already has a customer/vendor with the given name, so return FALSE.
        if(count($customerOrVendorAlreadyExistsResult) !== 0) return FALSE;

        // Insert the new customer/vendor into the database.
        $this->runQuery(
            'INSERT INTO BooksDB.'
                . ($isCustomer ? 'Customers' : 'Vendors')
                . ' (userID, name, address) VALUES (?, ?, ?)',
            'sss',
            $userID,
            $name,
            $address);

        // If we made it here, everything must have gone well, so return TRUE.
        // (It is possible the insertion was unsuccessful, but no exceptions
        // were thrown by it; worst case the customer/vendor was not actually
        // added to the database.)
        return TRUE;
    }

    /**
     * A method to add a vendor to the database.
     *
     * @param $userID the ID of the user with whom this vendor is associated.
     * @param $name the name of the vendor.
     * @param $address the address of the vendor.
     *
     * @return TRUE if the vendor was added successfully; FALSE if the user
     * already has a vendor by that name.
     */
    public function addVendor(string $userID, string $name, string $address) {
        return $this->addCustomerOrVendor(FALSE, $userID, $name, $address);
    }

    /**
     * A method to get all of the customers of a user.
     *
     * @param $userID the ID of the user.
     *
     * @return a numeric array of associative arrays containing elements "name"
     * and "address".
     */
    public function getCustomers(string $userID) {
        return $this->getCustomersOrVendors(TRUE, $userID);
    }

    /**
     * A method to get all of the customers or vendors of a user.
     *
     * @param $userID the ID of the user.
     *
     * @return a numeric array of associative arrays containing elements "name"
     * and "address".
     */
    private function getCustomersOrVendors(bool $customers, string $userID) {
        // Select all of the user's customers/vendors from the database.
        $getCustomersOrVendorsResult = $this->runQuery(
            'SELECT name, address FROM BooksDB.'
                . ($customers ? 'Customers' : 'Vendors')
                . ' WHERE userID = ?',
            's',
            $userID);

        // If DatabaseConnection::runQuery(string,string,...mixed) returns
        // FALSE, an error occurred, so throw an exception.
        if($getCustomersOrVendorsResult === FALSE)
            throw new DatabaseException(
                'DatabaseConnection::runQuery(string,string,...mixed) failed.');

        // Return the numeric array of associative arrays containing all of the
        // user's customers/vendors.
        return $getCustomersOrVendorsResult;
    }

    /**
     * A method to get all of the vendors of a user.
     *
     * @param $userID the ID of the user.
     *
     * @return a numeric array of associative arrays containing elements "name"
     * and "address".
     */
    public function getVendors(string $userID) {
        return $this->getCustomersOrVendors(FALSE, $userID);
    }
}
