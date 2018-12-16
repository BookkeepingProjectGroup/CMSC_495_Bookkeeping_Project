/**
 * @file app.js
 * @fileoverview The main module of the program, contains several access
 * namespaces denoting which functions, arrays, enums, and variables may be
 * returned for external or global usage. Begun 10/28/18
 * @author Andrew Eissen
 */
'use strict';

/**
 * @description The primary JavaScript module. This script, making use of the
 * conventional ES5 IIFE module paradigm to denote levels of external global
 * access to included functionality, makes use of a pair of object literals to
 * denote Java-esque private and public access levels. Contained within a single
 * named immediately-invoked function expression, only those functions included
 * as properties of the public <code>accessible</code> object are externally
 * available, as this is the only object returned from the function following
 * its invocation.
 * <br />
 * <br />
 * This module contains all the front-end code related to the generation of
 * individual pages of the interface with which the user can interact, called
 * "scenes." Scenes are all technically part of the same web page, but are
 * created and changed dynamically as needed, built from templates using a set
 * of JavaScript builders and assembly functions that are called when the user
 * presses certain buttons that request the next scene. An example would be the
 * initial creation of the login portal scene. Upon pressing the login button,
 * the current scene would fade away via animations and be replaced by the main
 * dashboard scene displaying the ledger and things. On logging out, the main
 * dashboard would be removed and the login scene rebuilt. In addition to these
 * macro scenes, mini-scenes appear as well in the popup modals that serve as
 * the main means by which user input is facilitated and data is passed to the
 * back-end database.
 * <br />
 * <br />
 * Functions in <code>inaccessible</code> are organized into 6 major groups that
 * encapsulate certain responsibilities. Utility functions contain functions
 * of a variety of uses that are designed to simplify certain basic tasks while
 * maintaining some degree of readability. Assembly functions build certain DOM
 * elements and return the preassembled <code>HTMLElement</code>s for addition
 * to the page by another function. Builder functions use assembly functions to
 * dynamically create scenes that make up the HTML of the page as seen from the
 * user's perspective, returning these HTML framework skeletons for addition to
 * the page. Display functions are used to add scenes and elements to their
 * respective places in the page while handling ancillary tasks like the
 * application of event listeners and the like. Handler functions, as the name
 * implies, are event listener handlers and action handlers that translate the
 * user's desired button-mediated actions into application logic, and generally
 * are used to interface with the database in the passage or request of data.
 * <br />
 * <br />
 * <pre>
 * Table of contents
 * - Script-globals             Line 0085
 * - Enums
 *   - Utility                  Line 0142
 *   - Scenes                   Line 0166
 *   - Identifiers              Line 0199
 *   - Text                     Line 0389
 *   - Operations               Line 0523
 *   - ModalButtons             Line 0603
 *   - ModuleButtons            Line 0701
 *   - Types                    Line 0763
 * - Data arrays
 *   - sidebarButtonData        Line 0819
 *   - navlinksButtonData       Line 0994
 * - Function groups
 *   - Utility functions        Line 1035
 *   - Assembly functions       Line 1685
 *   - Builder functions        Line 1929
 *   - Display functions        Line 3354
 *   - Handler functions        Line 3697
 *   - Main function            Line 5035
 *   - Public functions         Line 5074
 * </pre>
 *
 * @see {@link //google.github.io/styleguide/jsguide.html|Styleguide #1}
 * @see {@link //google.github.io/styleguide/javascriptguide.xml|Styleguide #2}
 * @author Andrew Eissen
 * @module BookkeepingProjectModule
 * @const
 */
const BookkeepingProjectModule = (function () {

  // Script-globals

  // Declare access object namespaces (basically public and private)
  let accessible, inaccessible;

  // Define access object namespaces
  accessible = accessible || {};
  inaccessible = inaccessible || {};

  /**
   * @description This constant is used to test the program and display messages
   * in the console related to the success or failure of operations or GET/POST
   * requests. Originally, it also handled the toggling of the application test
   * mode as well, though that functionality was eventually split off and
   * handled by the related <code>TESTING</code> constant flag.
   * <br />
   * <br />
   * Though not a part of the <code>inaccessible</code> object, the constant is
   * still contained within the private restricted scope of the
   * <code>BookkeepingProjectModule</code> IIFE and cannot be accessed
   * externally.
   *
   * @const
   */
  const DEBUG = false;

  /**
   * @description This constant is used to allow the program to run in a test
   * capacity divorced from the use of the database. Instead of making calls to
   * the server for data via the PHP endpoints, it instead queries a set of
   * static JSON files containing test JSON data related to accounts, documents,
   * vendors, customers, and ledger entries. This assists the front-end team in
   * debugging of default display behavior and styling elements as they would
   * appear in the production build.
   * <br />
   * <br />
   * Though not a part of the <code>inaccessible</code> object, the constant is
   * still contained within the private restricted scope of the
   * <code>BookkeepingProjectModule</code> IIFE and cannot be accessed
   * externally.
   *
   * @const
   */
  const TESTING = false;

  /**
   * @description Enum for assorted utility constants. Herein are set assorted
   * default values of helper constants required in various contexts. These
   * values are included in an object-global private enum to assist in ease of
   * adjustment if a value needs to be changed universally for all elements or
   * functions making use of that value. Object is made immutable via
   * <code>Object.freeze</code>.
   *
   * @readonly
   * @enum {number}
   * @const
   */
  const Utility = Object.freeze({
    FADE_IN_INTERVAL: 8,              // Joint fade/swipe right rate (ms)
    OPACITY_INCREASE_AMOUNT: 0.035,   // Amount to increase/decrease opacity
    ELEMENT_CHECK_INTERVAL: 500,      // Rate at which to check for element
    SWIPE_INTERVAL_TIME: 2000,        // Max time permitted for swipe right
    CHECK_OPACITY_RATE: 500,          // Rate at which we check for opacity == 0
    DELETE_CHECKBOX_CELL_WIDTH: 75,   // Max pixel count for deletion checkbox
  });

  /**
   * @description This enum is used to store integer values associated with the
   * different possible macro-scenes that can be loaded via user interactions.
   * These values are the possible values of <code>inaccessible.scene</code>, an
   * object property integer flag that indicates to certain functions what scene
   * is currently being displayed. In some cases, local variable values may
   * differ depending on the scene being displayed, allowing for the removal of
   * some scene-specific redundant code and permitting the use of one-size-fits-
   * all handlers in some cases. In effect, the use of this enum allows for the
   * reduction of duplicate code in most cases.
   *
   * @readonly
   * @enum {integer}
   * @const
   */
  const Scenes = Object.freeze({
    MODAL: 0,       // Modal framework
    LOGIN: 1,       // Login module (Login + Create)
    DASHBOARD: 2,   // Dashboard (Masthead & various HTML tables)
  });

  /**
   * @description This enum is used to store the <code>String</code>
   * representations of the various DOM element ids and class names present in
   * the interface. This enum is useful in assisting the process of grabbing
   * elements in the DOM via <code>document.getElementById</code> in multiple
   * places, allowing the user to adjust these names as needed without having to
   * sift through all the application logic functions below for each appearance.
   * <br />
   * <br />
   * Additionally, it aids in the dynamic element assembly method via the
   * assembly function <code>inaccessible.assembleElement</code>, the likes of
   * which handles the heavy lifting of element creation, supplied with ids and
   * class names in this enum for the building of the <code>HTMLElement</code>
   * instances. Object is made immutable via <code>Object.freeze</code>.
   * <br />
   * <br />
   * The naming format is several-fold. The first part indicates whether the
   * constant is a class or id name, the second denotes the page scene in which
   * the identifier appears (general constants apply to multiple scenes), the
   * third usually indicates the semantic tag or major section in which the
   * identifier appears, and the fourth and onwards provide details as to what
   * purposes the identifiers' elements serve in the template framework.
   *
   * @readonly
   * @enum {string}
   * @const
   */
  const Identifiers = Object.freeze({

    // Login page
    ID_LOGIN_CONTAINER: 'login-container',
    ID_LOGIN_TOPBAR: 'login-topbar',
    ID_LOGIN_MAIN: 'login-main',
    ID_LOGIN_CONTENT: 'login-content',
    ID_LOGIN_BODY: 'login-body',
    ID_LOGIN_BODY_HEADER: 'login-body-header',
    ID_LOGIN_BODY_INPUT_HOLDER: 'login-body-input-holder',
    ID_LOGIN_BODY_INPUT_USERNAME: 'login-body-input-username',
    ID_LOGIN_BODY_INPUT_PASSWORD: 'login-body-input-password',
    ID_LOGIN_BODY_INPUT_REENTER: 'login-body-input-reenter',
    ID_LOGIN_FOOTER: 'login-footer',
    ID_LOGIN_FOOTER_BUTTONS_HOLDER: 'login-footer-buttons-holder',
    ID_LOGIN_FOOTER_BUTTONS_CREATE: 'login-footer-buttons-create',
    ID_LOGIN_FOOTER_BUTTONS_SUBMIT: 'login-footer-buttons-submit',
    ID_LOGIN_FOOTER_BUTTONS_NEW: 'login-footer-buttons-new',
    ID_LOGIN_FOOTER_BUTTONS_BACK: 'login-footer-buttons-back',
    ID_LOGIN_FOOTER_BUTTONS_CLEAR: 'login-footer-buttons-clear',

    // Main application dashboard
    ID_DASHBOARD_CONTAINER: 'dashboard-container',
    ID_DASHBOARD_NAVIGATION: 'dashboard-navigation',
    ID_DASHBOARD_TOPBAR: 'dashboard-topbar',
    ID_DASHBOARD_TOPBAR_META: 'dashboard-topbar-meta',
    ID_DASHBOARD_TOPBAR_META_TITLE: 'dashboard-topbar-meta-title',
    ID_DASHBOARD_TOPBAR_META_SUBTITLE: 'dashboard-topbar-meta-subtitle',
    ID_DASHBOARD_TOPBAR_NAVLINKS: 'dashboard-topbar-navlinks',
    ID_DASHBOARD_TOPBAR_NAVLINKS_HOLDER: 'dashboard-topbar-navlinks-holder',
    ID_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP: 'dashboard-topbar-navlinks-changep',
    ID_DASHBOARD_TOPBAR_NAVLINKS_PRINT: 'dashboard-topbar-navlinks-print',
    ID_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT: 'dashboard-topbar-navlinks-logout',
    ID_DASHBOARD_SECTION: 'dashboard-section',
    ID_DASHBOARD_SIDEBAR: 'dashboard-sidebar',
    ID_DASHBOARD_SIDEBAR_BUTTONS: 'dashboard-sidebar-buttons',
    ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_D: 'dashboard-sidebar-buttons-view-d',
    ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_A: 'dashboard-sidebar-buttons-view-a',
    ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_C: 'dashboard-sidebar-buttons-view-c',
    ID_DASHBOARD_SIDEBAR_BUTTONS_ViEW_V: 'dashboard-sidebar-buttons-view-v',
    ID_DASHBOARD_SIDEBAR_BUTTONS_DOCUMENT: 'dashboard-sidebar-buttons-document',
    ID_DASHBOARD_SIDEBAR_BUTTONS_CUSTOMER: 'dashboard-sidebar-buttons-customer',
    ID_DASHBOARD_SIDEBAR_BUTTONS_VENDOR: 'dashboard-sidebar-buttons-vendor',
    ID_DASHBOARD_SIDEBAR_BUTTONS_DELETE: 'dashboard-sidebar-buttons-delete',
    ID_DASHBOARD_SIDEBAR_BUTTONS_DEFAULT: 'dashboard-sidebar-buttons-default',
    ID_DASHBOARD_LEDGER: 'dashboard-ledger',
    ID_DASHBOARD_WRAPPER: 'dashboard-ledger-table',
    ID_DASHBOARD_FOOTER: 'dashboard-footer',

    // Modal framework ids
    ID_MODAL_BLACKOUT: 'modal-blackout',
    ID_MODAL_MAIN: 'modal-main',
    ID_MODAL_HEADER: 'modal-header',
    ID_MODAL_HEADER_TITLE: 'modal-header-title',
    ID_MODAL_SECTION: 'modal-section',
    ID_MODAL_FOOTER: 'modal-footer',
    ID_MODAL_FOOTER_BUTTONS: 'modal-footer-buttons',

    // Change password modal
    ID_CHANGEP_CONTAINER: 'modal-changepassword-container',
    ID_CHANGEP_INFORMATION: 'modal-changepassword-information',
    ID_CHANGEP_FORM: 'modal-changepassword-form',
    ID_CHANGEP_INPUT_PASSWORD: 'modal-changepassword-input-password',
    ID_CHANGEP_INPUT_REENTER: 'modal-changepassword-input-reenter',

    // Add customer/vendor (CORV -> Customer OR Vendor)
    ID_CORV_CONTAINER: 'modal-corv-container',
    ID_CORV_INFORMATION: 'modal-corv-information',
    ID_CORV_FORM: 'modal-corv-form',
    ID_CORV_INPUT_NAME: 'modal-corv-input-name',
    ID_CORV_INPUT_ADDRESS: 'modal-corv-input-address',

    // Add document
    ID_DOCUMENT_CONTAINER: 'modal-document-container',
    ID_DOCUMENT_INFORMATION: 'modal-document-information',
    ID_DOCUMENT_INPUT_NAME_HOLDER: 'modal-document-input-name-holder',
    ID_DOCUMENT_INPUT_NAME: 'modal-document-input-name',
    ID_DOCUMENT_DROPDOWN_HOLDER: 'modal-document-dropdown-holder',
    ID_DOCUMENT_DROPDOWN_TYPE: 'modal-document-dropdown-type',
    ID_DOCUMENT_DROPDOWN_PARTY: 'modal-document-dropdown-party',
    ID_DOCUMENT_DROPDOWN_OPTION: 'modal-document-dropdown-option',
    ID_DOCUMENT_TABLE_HOLDER: 'modal-document-table-holder',
    ID_DOCUMENT_TABLE: 'modal-document-table',

    // Add account
    ID_ADDACC_INFORMATION: 'modal-addacc-information',
    ID_ADDACC_FORM: 'modal-addacc-form',
    ID_ADDACC_INPUT_HOLDER: 'modal-addacc-input-holder',
    ID_ADDACC_INPUT_CODE: 'modal-addacc-input-code',
    ID_ADDACC_INPUT_NAME: 'modal-addacc-input-name',
    ID_ADDACC_DROPDOWN_HOLDER: 'modal-addacc-dropdown-holder',
    ID_ADDACC_DROPDOWN_TYPE: 'modal-addacc-dropdown-type',

    // Add default accounts
    ID_DEFAULT_CONTAINER: 'modal-default-container',
    ID_DEFAULT_INFORMATION: 'modal-default-information',
    ID_DEFAULT_LIST_HOLDER: 'modal-default-list-holder',
    ID_DEFAULT_LIST: 'modal-default-list',

    // Masthead ids
    ID_MASTHEAD_CONTAINER: 'masthead-container',
    ID_MASTHEAD_HEADER: 'masthead-header',
    ID_MASTHEAD_HEADER_TITLE: 'masthead-header-title',
    ID_MASTHEAD_MAIN: 'masthead-main',
    ID_MASTHEAD_MAIN_ABOUT: 'masthead-main-about',
    ID_MASTHEAD_MAIN_ABOUT_TITLE: 'masthead-main-about-title',
    ID_MASTHEAD_MAIN_ABOUT_TEXT: 'masthead-main-about-text',
    ID_MASTHEAD_MAIN_AUTHORS: 'masthead-main-authors',
    ID_MASTHEAD_MAIN_AUTHORS_TITLE: 'masthead-main-authors-title',
    ID_MASTHEAD_MAIN_AUTHORS_TEXT: 'masthead-main-authors-text',

    // General purpose ids that show up on multiple modules
    ID_GENERAL_BODY: 'application-body',
    ID_GENERAL_TOPBAR_META_HOLDER: 'general-topbar-meta-holder',
    ID_GENERAL_TOPBAR_META_TITLE: 'general-topbar-meta-title',
    ID_GENERAL_TOPBAR_META_SUBTITLE: 'general-topbar-meta-subtitle',
    ID_GENERAL_STATUS_DIV: 'general-status',

    // Assorted login scene classes
    CLASS_LOGIN_GENERAL_EXTRA_PADDING: 'login-general-title-extra-padding',
    CLASS_LOGIN_BODY_INPUT_TEXTBOX: 'login-body-input-textbox',

    // Dashboard classes
    CLASS_DASHBOARD_SIDEBAR_BUTTONS_HOLDER: 'dashboard-sidebar-buttons-holder',
    CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT: 'dashboard-sidebar-buttons-item',
    CLASS_DASHBOARD_LEDGER_TABLE_HEADER: 'dashboard-ledger-table-header',
    CLASS_DASHBOARD_LEDGER_TABLE_CHECKBOX: 'dashboard-ledger-table-checkbox',

    // Modal classes
    CLASS_MODAL_MAJOR_SECTION: 'modal-major-section',
    CLASS_MODAL_BUTTON: 'modal-footer-buttons-button',
    CLASS_MODAL_SECTION_TEXTBOX: 'modal-section-textbox',
    CLASS_MODAL_DROPDOWN: 'modal-dropdown',
    CLASS_MODAL_DROPDOWN_OPTION: 'modal-dropdown-option',

    // Add document classes
    CLASS_DOCUMENT_TABLE_ROW_CELL: 'modal-document-table-cell',
    CLASS_DOCUMENT_TABLE_ROW_INPUT: 'modal-document-table-input',
    CLASS_DOCUMENT_TABLE_ROW_WRAPPER: 'modal-document-table-row',
    CLASS_DOCUMENT_TABLE_ROW_DROPDOWN: 'modal-document-table-dropdown',

    // Add default accounts
    CLASS_DEFAULT_LIST_ELEMENT: 'modal-default-list-element',

    // Masthead module classes
    CLASS_MASTHEAD_H2: 'masthead-title-h2',
    CLASS_MASTHEAD_H3: 'masthead-title-h3',
    CLASS_MASTHEAD_SECTION: 'masthead-section',
    CLASS_MASTHEAD_TEXT_CONTAINER: 'masthead-text-container',

    // General scene usage classes
    CLASS_GENERAL_CONTAINER: 'general-container',
    CLASS_GENERAL_MAJOR_SECTION: 'general-major-section',
    CLASS_GENERAL_TOPBAR_DIV: 'general-topbar-div',
    CLASS_GENERAL_ACTION_BUTTON: 'general-action-button',
    CLASS_GENERAL_BIG_BUTTON: 'general-big-button',
    CLASS_GENERAL_LINK_BUTTON: 'general-link-button',
    CLASS_GENERAL_FLEX_JUSTIFY: 'general-flex-justify',
    CLASS_GENERAL_OPENSANS: 'general-opensans',
    CLASS_GENERAL_MONTSERRAT: 'general-montserrat',
    CLASS_GENERAL_ARIAL: 'general-arial',
    CLASS_GENERAL_BUTTONS_HOLDER: 'general-buttons-holder',
    CLASS_GENERAL_STATUS_SUCCESS: 'general-status-success',
    CLASS_GENERAL_STATUS_FAILURE: 'general-status-failure',
  });

  /**
   * @description This enum is used to store all the text <code>String</code>s
   * used in the display of popup <code>window.alert</code>s or error messages
   * to be appended to the main container element, as well as the text nodes of
   * button or checkbox label elements. Additionally, the bulk block text
   * related to the display of the masthead paragraphs is also contained herein.
   * Those in particular should have likely been template strings rather than
   * concatenated string primitives in accordance with the Google styleguide
   * recommendations, but the author dislikes breaks in formatting so he ignored
   * their use thereof.
   * <br />
   * <br />
   * These could also be stored externally in a dedicated IIFE module or in a
   * JSON file that could be loaded asynchronously on DOM creation and document
   * ready, but I left them in here to reduce overhead on the bandwidth via the
   * need for another GET request or file import in the HTML file. This is a
   * pretty short application anyway with only a few long strings that don't
   * require constant change and alteration, so the need for accessing an
   * external file that sees frequent change is unnecessary.
   *
   * @readonly
   * @enum {string}
   * @const
   */
  const Text = Object.freeze({

    // Input textfield specific text
    INPUT_LOGIN_BODY_USERNAME_PLACEHOLDER: 'Username',
    INPUT_LOGIN_BODY_PASSWORD_PLACEHOLDER: 'Password',
    INPUT_LOGIN_BODY_REENTER_PLACEHOLDER: 'Reenter password',
    INPUT_CHANGEP_PASSWORD_PLACEHOLDER: 'Enter new password',
    INPUT_CHANGEP_REENTER_PLACEHOLDER: 'Confirm password',
    INPUT_CORV_NAME_PLACEHOLDER: 'Name',
    INPUT_CORV_ADDRESS_PLACEHOLDER: 'Address',
    INPUT_DOCUMENT_PARTY_OPTION: 'Add associated party',
    INPUT_DOCUMENT_NAME_PLACEHOLDER: 'Add document name',
    INPUT_DOCUMENT_DATE_PLACEHOLDER: 'Date',
    INPUT_DOCUMENT_AMOUNT_PLACEHOLDER: 'Amount',
    INPUT_DOCUMENT_DESCRIPTION_PLACEHOLDER: 'Description',
    INPUT_DOCUMENT_OPTION_CODE: 'Code',
    INPUT_DOCUMENT_OPTION_CREDIT: 'Credit',
    INPUT_DOCUMENT_OPTION_DEBIT: 'Debit',
    INPUT_ADDACC_CODE_PLACEHOLDER:'Code',
    INPUT_ADDACC_NAME_PLACEHOLDER: 'Name',

    // Buttons
    BUTTON_LOGIN_FOOTER_CREATE: 'Create',
    BUTTON_LOGIN_FOOTER_SUBMIT: 'Login',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP: 'Change password',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_PRINT: 'Print table',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT: 'Logout',
    BUTTON_MODAL_FOOTER_SUBMIT: 'Submit',
    BUTTON_MODAL_FOOTER_CLEAR: 'Clear',
    BUTTON_MODAL_FOOTER_CLOSE: 'Close',
    BUTTON_MODAL_FOOTER_NEWROW: 'New row',
    BUTTON_MODAL_FOOTER_DELETEROW: 'Delete rows',
    BUTTON_LOGIN_FOOTER_NEW: 'Submit details',
    BUTTON_LOGIN_FOOTER_BACK: 'Back',
    BUTTON_LOGIN_FOOTER_CLEAR: 'Clear',

    // Paragraphs, div content, etc.
    DIV_LOGIN_BODY_HEADER: 'Login or create account',
    DIV_GENERAL_DASH: '—',
    DIV_GENERAL_TABLE_HIDE_CHECKBOX: 'hide',
    DIV_GENERAL_TOGGLE: 'Toggle views',
    DIV_GENERAL_ADD: 'Add $1',
    DIV_GENERAL_TOGGLE_DOCS: 'View documents',
    DIV_GENERAL_TOGGLE_ACCOUNTS: 'View accounts',
    DIV_GENERAL_TOGGLE_CUSTOMERS: 'View customers',
    DIV_GENERAL_TOGGLE_VENDORS: 'View vendors',
    DIV_GENERAL_HIDE_ROW: 'Hide entry',
    DIV_GENERAL_DEFAULT_ACCOUNTS: 'Add default accounts',
    DIV_GENERAL_TOPBAR_TITLE: 'Keep Dem Books Y\'all',
    DIV_GENERAL_TOPBAR_SUBTITLE: 'A bookkeeping application for CMSC 495',
    DIV_CHANGEP_INFORMATION: 'Please note that password entries must match',
    DIV_CORV_INFORMATION: 'Please input an entry name and address',
    DIV_DOCUMENT_INFORMATION: 'Please select document type & associated party',
    DIV_ADDACC_INFORMATION: 'Please input account numeric code and name',
    DIV_DEFAULT_SUMMARY: '"#2" (code #1) of type "#3"',
    DIV_DEFAULT_INFORMATION_SUCCESS: 'The following accounts have been added:',
    DIV_DEFAULT_INFORMATION_FAILURE: 'Default accounts already exist',
    DIV_TABLE_BUILD_FAILURE: 'Build error',
    DIV_TABLE_BUILD_ERROR: 'An error was encountered in the course of ' +
      'building the #1 table, possibly due to a lack of entries. Please try ' +
      'again or use the included "Add #2" sidebar button to populate the ' +
      'table with entries.',
    DIV_TABLE_BUILD_MISSING_ENTRIES: 'No entries exist in the #1 table. ' +
      'Please use the included "Add #2" sidebar button to populate this ' +
      'table with entries prior to viewing its contents.',

    // Error and success status text entries
    ERROR_NETWORK: 'A network error has been encountered',
    ERROR_OTHERERROR: 'A submission error was encountered. Please correct ' +
      'any errors and try again',
    ERROR_ILLEGITIMATE_INPUT: 'Input content must be alphanumeric',
    ERROR_ILLEGITIMATE_INPUT_BLANK: 'Input fields must not be blank',
    ERROR_MISMATCHING_PASSWORDS: 'Passwords do not match',
    ERROR_FAILED_PASSWORD_RESET: 'Password reset unsuccessful',
    ERROR_LOGIN_FAILED: 'Login failed. Please check login details',
    ERROR_CORV_DUPLICATE: 'An entry with that name or address already exists',
    ERROR_DOCU_PARTY_DISPLAY: 'Could not display extant $1',
    ERROR_DOCU_NAME_ANUMER: 'Document name must be alphanumeric',
    ERROR_DOCU_CODE_NUMER: 'Code must be numeric',
    ERROR_DOCU_DATE_FORMAT: 'Date must be formatted as YYYY-MM-DD',
    ERROR_DOCU_AMOUNT: 'Amount must be formatted as XXXX.XX',
    ERROR_DOCU_DESC_ANUMER: 'Description must be alphanumeric',
    ERROR_DOCU_BLANK_INPUT: 'Entry input fields cannot be blank',
    ERROR_ACCOUNT_EXISTS: 'An account with this name already exists',
    ERROR_ADDACC_DUPLICATE: 'An account with these details already exists',
    SUCCESS_ACCOUNT_CREATED: 'Account successfully created',
    SUCCESS_PASSWORD_RESET: 'Password successfully reset',
    SUCCESS_CORV_SUBMIT: 'New entry successfully added',
    SUCCESS_DOCU_CREATED: 'New document successfully created',
    SUCCESS_ADDACC_SUBMIT: 'New account successfully created',

    // Masthead text
    MASTHEAD_HEADER_TITLE: 'Welcome to the Bookkeeping Project application!',
    MASTHEAD_ABOUT_HEADER: 'About',
    MASTHEAD_ABOUT_TEXT: 'Welcome to Group 4\'s final project submission for ' +
      'CMSC 495, a bookkeeping web application for small business owners ' +
      'capable of collecting, collating, and displaying basic financial ' +
      'data in a series of tables. Through the use of the sidebar buttons, ' +
      'users may open modal windows used to input new accounts, customers, ' +
      'vendors, or documents; view relevant tables in the dashboard; or ' +
      'delete entries at will. Additionally, users may interact with the ' +
      'topbar navigation links to change their account passwords, print out ' +
      'the currently-viewed table for their personal records, or sign out ' +
      'and return to the login screen.',
    MASTHEAD_AUTHORS_HEADER: 'Authors',
    MASTHEAD_AUTHORS_TEXT: 'This web application was constructed using a ' +
      'combination of PHP and SQL on the back-end and pure ES6 JavaScript ' +
      'on the front-end, with styling applied through the use of CSS3. The ' +
      'team responsible for its construction consists of six individuals ' +
      'organized into two main teams. The back-end team, consisting of ' +
      'Matthew Dobson and Kevin Ramirez, handled the development of the ' +
      'bookkeeping application logic and REST-compliant endpoints. The ' +
      'front-end team, consisting of Andrew Eissen, Jennifer Brady, and ' +
      'Christian Rondon, handled the construction and styling of the ' +
      'user interface. Both teams were assisted by generalist developer ' +
      'Steven Wu as needed in the implementation and unit testing of the ' +
      'application codebase.',
  });

  /**
   * @description This enum contains a listing of commonly used algebraic
   * functions primarily for use in the body of the jQuery-esque fading function
   * <code>inaccessible.fade</code>. The use of this enum, the contents of which
   * are not expected to change or require redefinition and are thus sealed via
   * <code>Object.freeze()</code>, removes the need for separate fade in and
   * fade out functions. Instead, depending on the type of fade being performed,
   * the appropriate algebraic function can be called from here instead, with
   * the value returned for use. Basically simulates the passing of an operation
   * type as an argument.
   *
   * @readonly
   * @enum {function}
   * @const
   */
  const Operations = Object.freeze({

    /**
     * @description A simple addition operation involving two arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {number}
     */
    ADDITION: function (paramOperand1, paramOperand2) {
      return paramOperand1 + paramOperand2;
    },

    /**
     * @description A simple subtraction operation involving two arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {number}
     */
    SUBTRACTION: function (paramOperand1, paramOperand2) {
      return paramOperand1 - paramOperand2;
    },

    /**
     * @description A simple comparison operation involving a pair of arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {boolean}
     */
    GREATER_THAN: function (paramOperand1, paramOperand2) {
      return paramOperand1 > paramOperand2;
    },

    /**
     * @description A simple comparison operation involving a pair of arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {boolean}
     */
    LESS_THAN: function (paramOperand1, paramOperand2) {
      return paramOperand1 < paramOperand2;
    },
  });

  /**
   * @description This enum structure, specifically an object of objects, is
   * used to contain data related to the most common types of button available
   * for use in the popup modal window. Generally, as these modals are used to
   * provide user data to the server, they include input textboxes that will
   * need to be submitted by the user and potentially cleared of previous input.
   * To this end, this enum includes clear, submit, and close modal
   * configuration button data used to build such buttons via
   * <code>inaccessible.assembleButtonElement</code>. The various in-modal
   * mini-scene constructors are able to denote which default buttons to include
   * and can make shallow copies of some buttons in order to adjust click
   * handlers and the like as required for certain operations.
   * <br />
   * <br />
   * An example ModalButton config object with explanations is as follows:
   * <br />
   * <pre>
   * BUTTON: {
   *   buttonType: 'Button name',     // Text to appear on the button
   *   functionName: 'handler',       // Event listener/handler name
   *   functionArguments: [],         // Any arguments listener func needs
   *   requiresWrapper: false,        // Is button to be wrapped in a <div>?
   *   elementId: 'element-id',       // Element id (unique identifier)
   *   elementClasses: [
   *     'element-class-1',           // Array of element classes
   *   ],
   * },
   * </pre>
   *
   * @readonly
   * @enum {object}
   * @const
   */
  const ModalButtons = Object.freeze({
    CLOSE: {
      buttonType: Text.BUTTON_MODAL_FOOTER_CLOSE,
      functionName: 'handleModalClose',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_MODAL_FOOTER_BUTTONS + '-' +
          Text.BUTTON_MODAL_FOOTER_CLOSE.toLowerCase(),
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
        Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
    CLEAR: {
      buttonType: Text.BUTTON_MODAL_FOOTER_CLEAR,
      functionName: 'handleModalFormClear',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_MODAL_FOOTER_BUTTONS + '-' +
          Text.BUTTON_MODAL_FOOTER_CLEAR.toLowerCase(),
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
        Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
    SUBMIT: {
      buttonType: Text.BUTTON_MODAL_FOOTER_SUBMIT,
      functionName: 'handleModalFormSubmit',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_MODAL_FOOTER_BUTTONS + '-' +
          Text.BUTTON_MODAL_FOOTER_SUBMIT.toLowerCase(),
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
        Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
    NEW_ROW: {
      buttonType: Text.BUTTON_MODAL_FOOTER_NEWROW,
      functionName: 'handleModalFormRowAddition',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_MODAL_FOOTER_BUTTONS + '-' +
          Text.BUTTON_MODAL_FOOTER_NEWROW.toLowerCase(),
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
        Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
    DELETE_ROW: {
      buttonType: Text.BUTTON_MODAL_FOOTER_DELETEROW,
      functionName: 'handleRowRemoval',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_MODAL_FOOTER_BUTTONS + '-' +
          Text.BUTTON_MODAL_FOOTER_DELETEROW.toLowerCase(),
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
        Identifiers.CLASS_MODAL_BUTTON,
      ],
    }
  });

  /**
   * @description This enum stores button config objects used to construct the
   * login module's footer buttons as needed. Since the login scene handles both
   * account login and new account creation responsibilities, buttons related to
   * submission of new account data, navigation between mini-module scenes, and
   * logging into extant accounts are included herein. The button config objects
   * are built according to the similar style seen in the above enum, namely
   * <code>ModalButtons</code>, as they make use of the same assembly function
   * to construct, namely <code>inaccessible.assembleButtonElement</code>.
   * <br />
   * <br />
   * An example ModuleButtons config object with explanations is as follows:
   * <br />
   * <pre>
   * BUTTON: {
   *   buttonType: 'Button name',     // Text to appear on the button
   *   functionName: 'handler',       // Event listener/handler name
   *   functionArguments: [],         // Any arguments listener func needs
   *   requiresWrapper: false,        // Is button to be wrapped in a <div>?
   *   elementId: 'element-id',       // Element id (unique identifier)
   *   elementClasses: [
   *     'element-class-1',           // Array of element classes
   *   ],
   * },
   * </pre>
   *
   * @readonly
   * @enum {object}
   * @const
   */
  const ModuleButtons = Object.freeze({
    CREATE_ACCOUNT: { // Account creation scene
      buttonType: Text.BUTTON_LOGIN_FOOTER_CREATE,
      functionName: 'handleLoginSceneChanges',
      functionArguments: [
        'buildAccountCreationContent',
        ['BACK', 'NEW_ACCOUNT'],
      ],
      requiresWrapper: false,
      elementId: Identifiers.ID_LOGIN_FOOTER_BUTTONS_CREATE,
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    },
    LOGIN: { // Login scene
      buttonType: Text.BUTTON_LOGIN_FOOTER_SUBMIT,
      functionName: 'handleLogin',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_LOGIN_FOOTER_BUTTONS_SUBMIT,
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    },
    NEW_ACCOUNT: { // Submit new account details
      buttonType: Text.BUTTON_LOGIN_FOOTER_NEW,
      functionName: 'handleAccountCreation',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_LOGIN_FOOTER_BUTTONS_NEW,
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    },
    BACK: { // Back to login scene
      buttonType: Text.BUTTON_LOGIN_FOOTER_BACK,
      functionName: 'handleLoginSceneChanges',
      functionArguments: [
        'buildLoginContent',
        ['CREATE_ACCOUNT', 'LOGIN'],
      ],
      requiresWrapper: false,
      elementId: Identifiers.ID_LOGIN_FOOTER_BUTTONS_BACK,
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    },
  });

  /**
   * @description This enum is used to store several type-based configuration
   * objects used to construct new dropdown menu options related to the types of
   * document and account available for creation by the user. They are iterated
   * over by a <code>for...in</code> loop construct, with their data sent to
   * <code>inaccessible.assembleDropdownElement</code> for construction of a new
   * dropdown <code>option</code> element with dedicated <code>name</code> and
   * <code>value</code> properties.
   *
   * @readonly
   * @enum {object}
   * @const
   */
  const Types = Object.freeze({
    ACCOUNT: {
      ASSET: 'Asset',
      EQUITY: 'Equity',
      LIABILITY: 'Liability',
      REVENUE: 'Revenue',
      EXPENSE: 'Expense',
    },
    DOCUMENT: {
      JE: 'Journal entry',
      API: 'Accounts payable invoice',
      APD: 'Accounts payable disbursement',
      ARI: 'Accounts receivable invoice',
      ARR: 'Accounts receivable receipt',
    },
  });

  // Data arrays

  /**
   * @description This array of objects is used to store data pertaining to the
   * types of interface buttons to be appended to the sidebar. Contained in each
   * object are properties related to name, <code>String</code> representation
   * of the event listener handler function signature associated with that
   * button, and a set of potential arguments to pass as parameters to that
   * function, among other such properties related to unique and common
   * identifiers for the HTML elements themselves. Like the enums above, namely
   * <code>ModalButtons</code> and <code>ModuleButtons</code>, the buttons are
   * built via the main button creation assembly utility function,
   * <code>inaccessible.assembleButtonElement</code>, and thus possess the same
   * set of properties as those enum members.
   * <br />
   * <br />
   * The buttons themselves lack object property names and exist together in an
   * array instead of an object because they are created at once and do not
   * appear multiple places depending on the scene or module being viewed by the
   * user. As such, the use of a simple array to mass-create the buttons and
   * append them to the sidebar is the best means of displaying them to the user
   * given the expected circumstances of their appearance in the interface.
   * <br />
   * <br />
   * An example config object with explanations is as follows:
   * <br />
   * <pre>
   * {
   *   buttonType: 'Button name',     // Text to appear on the button
   *   functionName: 'handler',       // Event listener/handler name
   *   functionArguments: [],         // Any arguments listener func needs
   *   requiresWrapper: false,        // Is button to be wrapped in a <div>?
   *   elementId: 'element-id',       // Element id (unique identifier)
   *   elementClasses: [
   *     'element-class-1',           // Array of element classes
   *   ],
   * },
   * </pre>
   */
  inaccessible.sidebarButtonData = [
    { // Hide row
      buttonType: Text.DIV_GENERAL_HIDE_ROW,
      functionName: 'handleRowRemoval',
      functionArguments: [],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_DELETE,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Create default accounts
      buttonType: Text.DIV_GENERAL_DEFAULT_ACCOUNTS,
      functionName: 'handleDefaultAccountsAddition',
      functionArguments: [],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_DEFAULT,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Add account
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'account'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'account'),
        {name: 'buildAccountAdditionModal'},
        [ModalButtons.CLEAR],
        'handleAccountAddition',
      ],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_DOCUMENT,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Add document
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'document'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'document'),
        {name: 'buildDocumentAdditionModal'},
        [ModalButtons.NEW_ROW, ModalButtons.DELETE_ROW],
        'handleDocumentAddition',
      ],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_DOCUMENT,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Add customer
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'customer'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'customer'),
        {name: 'buildCustomerOrVendorAdditionModal'},
        [ModalButtons.CLEAR],
        'handleCustomerOrVendorAddition',
      ],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_CUSTOMER,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Add vendor
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'vendor'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'vendor'),
        {name: 'buildCustomerOrVendorAdditionModal'},
        [ModalButtons.CLEAR],
        'handleCustomerOrVendorAddition',
      ],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_VENDOR,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Get accounts
      buttonType: Text.DIV_GENERAL_TOGGLE_ACCOUNTS,
      functionName: 'handleTableDataLoading',
      functionArguments: ['accounts'],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_A,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Get documents
      buttonType: Text.DIV_GENERAL_TOGGLE_DOCS,
      functionName: 'handleTableDataLoading',
      functionArguments: ['documents'],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_D,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Get customers
      buttonType: Text.DIV_GENERAL_TOGGLE_CUSTOMERS,
      functionName: 'handleTableDataLoading',
      functionArguments: ['customers'],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_C,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    { // Get vendors
      buttonType: Text.DIV_GENERAL_TOGGLE_VENDORS,
      functionName: 'handleTableDataLoading',
      functionArguments: ['vendors'],
      requiresWrapper: true,
      elementId: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS_VIEW_V,
      elementClasses: [
        Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
  ];

  /**
   * @description This array, like that above it, contains button data in object
   * form, though this particular array's contents are related to the pseudo-
   * links included in the user's topbar navigation section to the far right of
   * the screen. Each button has a handler and a set of class and id identifiers
   * as well as the option of including a <code>div</code> wrapper. Like the
   * above array and the similar enums of objects, the button config objects
   * contained herein are assembled into usable buttons in the navbar by the
   * function <code>inaccessible.assembleButtonElement</code>.
   * <br />
   * <br />
   * The idea for these links originated with the author's familiarity with the
   * MediaWiki framework and its Monobook and Vector skins, both of which make
   * use of a similarly-styled set of button elements in the form of a top-right
   * navbar that are styled similarly to these.
   * <br />
   * <br />
   * An example config object with explanations is as follows:
   * <br />
   * <pre>
   * {
   *   buttonType: 'Button name',     // Text to appear on the button
   *   functionName: 'handler',       // Event listener/handler name
   *   functionArguments: [],         // Any arguments listener func needs
   *   requiresWrapper: false,        // Is button to be wrapped in a <div>?
   *   elementId: 'element-id',       // Element id (unique identifier)
   *   elementClasses: [
   *     'element-class-1',           // Array of element classes
   *   ],
   * },
   * </pre>
   */
  inaccessible.navlinksButtonData = [
    {
      buttonType: Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP,
      functionName: 'displayModal',
      functionArguments: [
        Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP,
        {name: 'buildPasswordChangeModal'},
        [ModalButtons.CLEAR],
        'handlePasswordChange',
      ],
      requiresWrapper: false,
      elementId: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP,
      elementClasses: [
        Identifiers.CLASS_GENERAL_LINK_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_PRINT,
      functionName: 'handlePagePrinting',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_PRINT,
      elementClasses: [
        Identifiers.CLASS_GENERAL_LINK_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT,
      functionName: 'handleLogout',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT,
      elementClasses: [
        Identifiers.CLASS_GENERAL_LINK_BUTTON,
        Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
  ];

  // Utility functions

  /**
   * @description This request handler is used to make <code>GET</code> and
   * <code>POST</code> requests in the request and passage of user data to and
   * from the back-end. It accepts as parameters a request type, an endpoint
   * name/address, and an optional object containing the request configuration
   * data such as the JSON encoding toggle indicator and the endpoint-specific
   * parameters containing user data in accordance with RESTful best practices
   * as applied to standard HTTP requests.
   * <br />
   * <br />
   * This particular one-size-fits-all handler replaced the previous approach to
   * the request process, which made use of an object property of the
   * <code>inaccessible</code> access scope object named <code>api</code>. This
   * object contained a pair of near-identical handlers for <code>GET</code> and
   * <code>POST</code> requests. Since the author wished to avoid the
   * overabundance of copy/pasta in the codebase, this object property was
   * removed and its function properties consolidated into this single function.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {string} paramType 'GET' or 'POST'
   * @param {string} paramUrl The name of the PHP endpoint i.e. "server.php"
   * @param {!object=} paramData Data in obj form to be stringified (optional)
   * @returns {Promise}
   */
  inaccessible.sendRequest = function (paramType, paramUrl, paramData = null) {

    // Declarations
    let that, request, params;

    // Preserve scope
    that = this;

    return new Promise(function (resolve, reject) {

      // Definition of new request
      request = new XMLHttpRequest();

      // Intialize request
      request.open(paramType, paramUrl);

      if (paramType === 'POST' && paramData != null) {
        if (paramData.encode === true) {
          request.setRequestHeader('Content-Type', 'application/json');
          params = JSON.stringify(paramData.params);
        } else {
          request.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded');
          params = that.serialize(paramData.params);
        }

        if (DEBUG) {
          console.log(params);
        }
      }

      // Resolve or reject Promise depending on request status
      request.onload = function () {
        if (request.status == 200) {
          resolve(request.response);
        } else {
          reject(Error(request.statusText));
        }
      };

      // Handle network errors
      request.onerror = function () {
        reject(Error(Text.ERROR_NETWORK));
      };

      // Make request (data will be either null or a stringified object)
      request.send(params);
    });
  };

  /**
   * @description This utility function was used by
   * <code>inaccessible.sendRequest</code> to determine whether or not the
   * passed <code>paramData</code> optional parameter had been
   * <code>JSON.stringify</code>'ed prior to passage. If so, the requester
   * used a JSON-based RESTful approach; otherwise, it used a query string
   * approach. However, this function was replaced by a simple
   * <code>encode</code> toggle attached with every invocation of the request
   * function which worked much more efficiently and made more sense from a
   * human point of view. This function was retained simply for archiving
   * purposes.
   *
   * @param {string} paramTarget String (could be JSONified)
   * @returns {boolean}
   */
  inaccessible.isJSON = function (paramTarget) {
    paramTarget = typeof paramTarget !== 'string'
      ? JSON.stringify(paramTarget)
      : paramTarget;

    try {
      paramTarget = JSON.parse(paramTarget);
    } catch (e) {
      return false;
    }

    return (typeof paramTarget === 'object' && paramTarget !== null);
  };

  /**
   * @description This function handles the translation of an inputted JS/JSON
   * object into a query string like that present in vanilla jQuery builders,
   * namely <code>$.params</code>. This is primarily for use in sending
   * <code>POST</code> requests in passing argument parameters as the data. It
   * is used in most cases of data transmission to the back-end, with the other
   * REST-compliant approach&mdash;namely the use of JSON-encoded data&mdash;
   * used only in certain cases as required by the PHP endpoints.
   *
   * @param {object} paramObject The JS/JSON object to be serialized
   * @returns {string} String formatted as <code>username=foo&password=X</code>
   */
  inaccessible.serialize = function (paramObject) {
     return Object.entries(paramObject).map((pair) => pair.join('=')).join('&');
  };

  /**
   * @description Like <code>inaccessible.prepend</code>, this function is based
   * on jQuery's <code>$.append()</code> function used to add a DOM element
   * to another based on a <code>String</code> representation of the container's
   * id or class name. The author had originally intended for this function and
   * its twin to see wider use in the file, but ended up using very little
   * despite it being one of the first functions added to the codebase at the
   * start of the class assignment.
   *
   * @param {string} paramTarget Element to which child is to be appended
   * @param {string} paramSubject Child node to be added
   * @returns {void}
   */
  inaccessible.append = function (paramTarget, paramSubject) {
    document.getElementById(paramTarget).appendChild(paramSubject);
  };

  /**
   * @description Like <code>inaccessible.append</code>, this function is based
   * on jQuery's <code>$.prepend()</code> function used to add a DOM element
   * to another based on a <code>String</code> representation of the container's
   * id or class name. The author had originally intended for this function and
   * its twin to see wider use in the file, but ended up using very little
   * despite it being one of the first functions added to the codebase at the
   * start of the class assignment.
   *
   * @param {string} paramTarget Element to which child is to be prepended
   * @param {string} paramSubject Child node to be added
   * @returns {void}
   */
  inaccessible.prepend = function (paramTarget, paramSubject) {
    document.getElementById(paramTarget).insertBefore(paramSubject,
        paramTarget.firstChild);
  };

  /**
   * @description This utility function is used to consolidate the contents of
   * an inputted array of numbers through the performing of an inputted common
   * algebraic operation. The associated value is then returned from the
   * function. Within this file, this function is only used with the
   * <code>Operations.ADDITION</code> and <code>Operations.SUBTRACTION</code>
   * operations; the comparison operations in the enum require a different
   * invocation method. It is used to adjust the opacity of a container element
   * to simulate a fade-in/fade-out function.
   *
   * @param {!Array<number>} paramList Array of number values
   * @param {string} paramOperation The <code>Operations</code> enum operation
   * @returns {number}
   */
  inaccessible.performCommonOperation = function (paramList, paramOperation) {
    return paramList.reduce(Operations[paramOperation]);
  };

  /**
   * @description This function returns a <code>boolean</code> value based on
   * whether or not the inputted JS object is an array. It will be used by
   * <code>inaccessible.assembleElement</code> to determine if the inputted
   * parameters need to be formatted as arrays or whether the user has correctly
   * passed well-formed input arguments to the function as expected. Originally,
   * the author was considering including in that function as inner function,
   * but eventually decided to keep things organized by locating all utility
   * functions in a specific section of the <code>inaccessible</code> scope
   * object.
   *
   * @param {object} paramTarget JS object to be checked
   * @returns {boolean} Returns <code>true</code> if object is an Array
   */
  inaccessible.isArray = function (paramTarget) {
    return Object.prototype.toString.call(paramTarget) === '[object Array]';
  };

  /**
   * @description This helper utility function is used to check assorted user
   * input data to ensure it is wellformed and alphanumeric. It returns an
   * associated <code>boolean</code> depending on the result of a check with the
   * approved regex. It is primarily used by submission button event listeners
   * in the modal and the login/account creation modules to check input
   * textfield content prior to passage to the back-end, throwing an error and
   * displaying a status notice if the value returned is <code>false</code>.
   *
   * @param {string} paramInput <code>String</code> to be checked
   * @returns {boolean} Returns <code>true</code> if input is alphanumeric
   */
  inaccessible.isLegalInput = function (paramInput) {
    return /^[a-z\d\-_,:;\s]+$/i.test(paramInput);
  };

  /**
   * @description This utility function, like the similar
   * <code>inaccessible.isLegalInput</code>, is used to compare a parameter
   * string against a set of regex to determine whether or not the included
   * monetary amount is properly formatted with decimals in the right places and
   * so forth. It is used in the document addition modal's ledger entry rows to
   * ensure that user amounts are formatted as <code>1000.00</code> or somesuch,
   * as per the associated endpoint's data input requirements as denoted in the
   * PHP documentation.
   *
   * @param {string} paramInput String representing amount of money (xxxx.xx)
   * @returns {boolean} Returns <code>true</code> if input is wellformed
   */
  inaccessible.isValidAmount = function (paramInput) {
    return /^\d+(?:\.\d{0,2})$/.test(paramInput);
  };

  /**
   * @description This utility function is used to convert a JSON object key to
   * a usable, properly formatted HTML table header for use in one of the five
   * possible table types. The works by accepting the object property identifier
   * of a return JSON data object (i.e. "vendorName") and looking ahead for
   * capital letters as per lowerCamelCase naming conventions. On finding such
   * capital letters, a space is inserted in front of that letter. Finally,
   * prior to returning the string from the function, the entire string's
   * capital letters are converted to their lowercase equivalents.
   *
   * @param {string} paramInput String representing Object.keys() entry
   * @returns {boolean} Returns formatted table header
   */
  inaccessible.convertKeyToHeader = function (paramInput) {
    return paramInput.split(/(?=[A-Z])/).join(' ').toLowerCase();
  };

  /**
   * @description This helper function returns a <code>boolean</code> denoting
   * whether or not the parameter <code>string</code> possesses any characters
   * other than whitespace. It is used primarily to determine whether or not the
   * user has left any pseudo-cells blank when seeking to create a new document
   * in the document addition modal's ledger entries rows. It could probably be
   * improved upon but it gets the job done as it is.
   *
   * @param {string} paramInput String of text to be evaluated for nonwhitespace
   * @returns {boolean} Returns <code>true</code> if input has no other chars
   */
  inaccessible.isBlank = function (paramInput) {
    return !paramInput.replace(/\s/g, '').length;
  };

  /**
   * @description This function is used to add new key/value pairs to an
   * existing object en masse without having to add each individually as per
   * standard practices. This function was intentionally constructed to work
   * like jQuery's <code>$.extend</code>. Originally, the author wrote this in a
   * much more verbose fashion to be ES5-compliant and somewhat-supportive of
   * legacy browsers; however, given the decision to go the ES6-route and not
   * bother with older browsers, this was simplified to a single line version
   * making use of the author's beloved spread operator.
   *
   * @param {object} paramTarget The object to be extended
   * @param {object} paramObject The new object to be joined
   * @returns {object} The extended object
   */
  inaccessible.extend = function (paramTarget, paramObject) {
    return {...paramTarget, ...paramObject};
  };

  /**
   * @description This pseudo-encoding utility function is used simply to
   * replace spaces with underscores and convert all extant capital letters in
   * the string to lowercase letters. This function may see an expansion that
   * incorporates more advanced encoding via more regex, but the present
   * implementation is sufficient for now. It was originally used to create
   * encoded values for use as dropdown option values in the document addition
   * modal as related to customer or vendor party entries, but was eventually
   * removed and retained simply for legacy archiving purposes.
   *
   * @param {string} paramString String to be encoded
   * @returns {string} Pseudo-encoded string
   */
  inaccessible.encode = function (paramString) {
    return paramString.toLowerCase().replace(/ /g, '_');
  };

  /**
   * @description This function is used by the handler function
   * <code>inaccessible.handleDocumentAddition</code> to determine whether or
   * not the user-inputted date for a ledger transaction is wellformed or not.
   * A <code>boolean</code> response is returned depending on the nature of the
   * input date. In accordance with the document addition modal's endpoint
   * documentation, the date must be formatted as YYYY-MM-DD and be an actual
   * correct date; dates with wild day counts that make no sense given the year
   * and month in question will be rejected.
   *
   * @param {string} paramDateString String input representing date (YYYY-MM-DD)
   * @returns {boolean} Whether the date is well-formed
   */
  inaccessible.isValidDate = function (paramDateString) {

    // Declarations
    let fragments, daysInMonth, year, month, day;

    // Break down the array into the component parts
    fragments = paramDateString.split('-');
    year = fragments[0];
    month = fragments[1];
    day = fragments[2];
    daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Handle leap years
    if ((!(year % 4) && year % 100) || !(year % 400)) {
      daysInMonth[1] = 29;
    }

    return !(/\D/.test(String(day))) && day > 0 && day <= daysInMonth[--month];
  };

  /**
   * @description This helper function is used to check whether or not a target
   * element exists in the DOM prior to triggering a <code>focus</code> event on
   * that element. It primarily sees use in the login module scene to focus in
   * on the username input textfield. The function makes use of
   * <code>setTimeout</code> to recursively call itself in its efforts to check
   * if the element exists yet (such as in the middle of a fading transition
   * event). It is part of the default post-load behavior of the
   * <code>LOGIN</code> scene as notated in the
   * <code>inaccessible.handlePostLoadAdjustments</code> handler function.
   *
   * @param {string} paramSelector String representation of element identifier
   * @returns {void}
   */
  inaccessible.focusOnLoad = function (paramSelector) {

    // Declarations
    let that, target;

    // Definitions
    that = this;
    target = document.querySelector(paramSelector);

    if (target != null) {
      target.focus();
      return;
    } else {
      setTimeout(function () {
        that.focusOnLoad(paramSelector);
      }, Utility.ELEMENT_CHECK_INTERVAL);
    }
  };

  /**
   * @description This function is used to check if an inputted element is a
   * wellformed DOM element, returning an associated <code>boolean</code> value
   * depending on the result. It is primarily used by
   * <code>inaccessible.assembleElement</code> to handle cases wherein certain
   * array elements constituting parts of the element to contruct may be
   * preassembled DOM elements nested within. Like its related helper function
   * <code>inaccessible.isArray</code>, it was originally planned to be
   * included as an inner function of <code>assembleElement</code>, but was left
   * in the <code>inaccessible</code> scope to keep things organized and
   * readable.
   *
   * @param {object} paramTarget Object to be checked for element status
   * @returns {boolean} Returns <code>true</code> if object is a DOM element
   */
  inaccessible.isElement = function (paramObject) {
    return (
      typeof HTMLElement === 'object'
        ? paramObject instanceof HTMLElement
        : (
          paramObject &&
          typeof paramObject === 'object' &&
          paramObject !== null &&
          paramObject.nodeType === 1 &&
          typeof paramObject.nodeName === 'string'
        )
    );
  };

  /**
   * @description This utility function is used to remove any half-assembled
   * element content stored within a certain inputted DOM element. <s>It may see
   * use in the clearing of a previous viewed ledger table in preparation for
   * displaying a new ledger document.</s> It sees use in the clearing of the
   * page on scene transition immediately after fading out of the scene,
   * appearing solely in the body of <code>inaccessible.tinderize</code>. It
   * could perhaps be integrated within that function given that it sees use
   * nowhere else in the module.
   *
   * @see {@link https://stackoverflow.com/a/3450726|Relevant SO Thread}
   * @param {string} paramElementId The identifier of the element to be cleared
   * @returns {void}
   */
  inaccessible.emptyElementOfContent = function (paramElementId) {

    // Declaration
    let element;

    // Definition
    element = document.getElementById(paramElementId);

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  /**
   * @description As the name implies, this utility function is used to replace
   * a number of instances in a parameter string at once without the need for
   * compound <code>replace()</code> invocations. The map of extracts to be
   * replaced and their desired replacements is notated by the object parameter
   * <code>paramMap</code>. It is used within the body of the builder function
   * <code>inaccessible.buildDefaultAccountsModal</code> to construct new list
   * elements in the unordered list present in the default accounts modal,
   * replacing default placeholder characters in a text template with the
   * specific account entries' codes, names, and types.
   *
   * @param {string} paramString String to be manipulated
   * @param {object} paramMap Map of strings to be replaced & their replacements
   * @returns {string} Adjusted string
   */
  inaccessible.replaceAll = function (paramString, paramMap) {
    return paramString.replace(
      new RegExp(Object.keys(paramMap).join("|"), "gi"),
      function (matched) {
        return paramMap[matched];
      }
    );
  };

  /**
   * @description This function is based on the similarly-named fading function
   * available by default in jQuery. As parameter-specified container elements
   * will have dynamically-set opacity values defined herein, this function just
   * increases or decreases the element's opacity until it reaches a value of 1
   * or 0, thus giving the impression of the scene fading in or out from the
   * start. This helps hide the often jerky page and interface assembly sequence
   * from view for a few milliseconds, also buying time for the request and
   * retrieval of user data from the database in the case of partial fades of
   * on-page container elements.
   * <br />
   * <br />
   * Additionally, as of the beginning of November, this function has been
   * refactored and slightly expanded to allow for fading in or out depending on
   * the value of an included <code>String</code> parameter, allowing for
   * seemless transitions between interface scenes as needed. Originally, there
   * were a pair of functions for fading in and out, both of which shared much
   * of the same code. In an effort to reduce copy/pasta, these were combined
   * into a single utility function that makes use of a computational enum for
   * the handling of simply algebraic operations related to the increase or
   * decrease of element opacity.
   *
   * @param {string} paramFadeType <code>String</code> indicating type of fade
   * @param {string} paramElementId Container/wrapper identifier
   * @return {void}
   */
  inaccessible.fade = function (paramFadeType, paramElementId) {

    // Declarations
    let that, container, interval, fadeTypeObject, fadeTypeParameters;

    // Preserve scope
    that = this;

    // Grab DOM element from id
    container = document.getElementById(paramElementId);

    // Set default opacity here rather than in config objects (as before)
    container.style.opacity = (paramFadeType === 'out') ? 1 : 0;

    // Removes need for separate functions
    fadeTypeParameters = Object.freeze({
      'in': {
        comparison: 'LESS_THAN',
        operator: 'ADDITION',
        comparisonValue: 1,
      },
      'out': {
        comparison: 'GREATER_THAN',
        operator: 'SUBTRACTION',
        comparisonValue: 0,
      },
    });

    // Based on fade type, select and use object with appropriate properties
    fadeTypeObject = fadeTypeParameters[paramFadeType];

    // Define interval handler
    interval = setInterval(function () {

      if ( // If either opacity < 1 or opacity > 0...
        Operations[fadeTypeObject.comparison](
          container.style.opacity,
          fadeTypeObject.comparisonValue
        )
      ) {

        // Either opacity + const_value or opacity - const_value
        container.style.opacity = that.performCommonOperation(
          [
            Number.parseFloat(container.style.opacity),
            Utility.OPACITY_INCREASE_AMOUNT,
          ],
          fadeTypeObject.operator
        );
      } else {
        clearInterval(interval);
        return;
      }
    }, Utility.FADE_IN_INTERVAL);
  };

  /**
   * @description This function is used to move the element specified via the
   * <code>String</code> identifier parameter to the right. It is to be used in
   * conjunction with <code>inaccessible.fade</code> to allow for a seamless
   * transition between scenes (i.e. login screen and the dashboard, etc.).
   * Depending on the parameters inputted to <code>inaccessible.tinderize</code>
   * as related to the swiping animation, this function may not be called in all
   * instances of scene or module loading, only when the macro-scene is being
   * changed (such as the shift between login module and main dashboard, etc.)
   * <br />
   * <br />
   * Originally, the initial implementation of this function involved some janky
   * coding that resulted in the container flickering to the left before
   * starting the animation. The current rewritten implementation should handle
   * such cases and require no CSS-based fixing to work as expected. It could
   * still use some perfecting, but it does work as expected and adds a nice
   * little aesthetic touch to what would otherwise be flat fading in and out
   * via the <code>inaccessible.fade</code> fading function.
   *
   * @see {@link https://stackoverflow.com/a/29490865|SO Thread}
   * @param {string} paramElementId Element identifier
   * @return {void}
   */
  inaccessible.swipeRight = function (paramElementId) {

    // Declarations
    let container, interval, startTime, timePassed;

    // Cache start time
    startTime = Date.now();

    // Set retrieved container's placement to relative
    container = document.getElementById(paramElementId);
    container.style.position= 'relative';

    // Define interval
    interval = setInterval(function () {

      // Check time since start
      timePassed = Date.now() - startTime;

      if (timePassed >= Utility.SWIPE_INTERVAL_TIME) {
        clearInterval(interval);
        return;
      }

      // Draw animation at the moment of timePassed
      container.style.left = `${timePassed / 5}px`;

    }, Utility.FADE_IN_INTERVAL);
  };

  /**
   * @description This function was designed to oversee the change of scenes
   * dynamically without having to default to the use of hardcoded HTML.
   * Depending on the input parameters, it generally fades out of the present
   * scene while shifting it right, removes the former content and builds the
   * required interface scene, then fades back in. Alternatively, based on its
   * specific use-cases, the function may only fade out of a certain in-scene
   * portion of the page, such as a <code>div</code> or <code>span</code>,
   * before replacing that content with new content (as seen in the shift from
   * the login module's login <code>form</code> to the related account creation
   * <code>form</code>). Also, the <code>inaccessible.swipeRight</code> function
   * may be toggled herein as well, with certain use-cases requiring only the
   * fading function rather than both the fading and swiping functions.
   * <br />
   * <br />
   * One optimization the author had considered was a caching function that
   * preserved the formerly assembled pages in <code>localStorage</code> or in a
   * session cookie, though since the interfaces are not overly complex, this
   * idea was eventually scrapped due to time constraints. Under present
   * circumstances, this implementation is fine as it is, adding a bit of color
   * to the dynamic construction of scene HTML and making the use of the app
   * easy and its design clean.
   *
   * @param {boolean} paramCanSwipeRight Use <code>swipeRight()</code>?
   * @param {string} paramElementId Present container id
   * @param {object} paramBuilder Obj containing function name & optional args
   * @param {!boolean=} paramCanAdjustPostLoad Is content adjusted post-load?
   * @returns {void}
   */
  inaccessible.tinderize = function (paramCanSwipeRight, paramElementId,
      paramBuilder, paramCanAdjustPostLoad = false) {

    // Declarations
    let that, interval, container, parent;

    // Definitions
    that = this;
    container = document.getElementById(paramElementId);
    parent = container.parentNode;

    // Move scene to the right and fade out prior to removing children from DOM
    if (paramCanSwipeRight) {
      this.swipeRight(paramElementId);
    }
    this.fade('out', paramElementId);

    // Maybe reconfigure using a promise as per the api method above?
    interval = setInterval(function () {
      if (container.style.opacity <= 0) {
        clearInterval(interval);

        // Set to zero exactly
        container.style.opacity = 0;

        // Remove outdated DOM elements
        that.emptyElementOfContent(parent.id);

        // Build new content
        parent.appendChild(that[paramBuilder.name](
          ...(paramBuilder.args != null) ? paramBuilder.args : []));

        // Make any scene-specific adjustments post-addition to page (optional)
        if (paramCanAdjustPostLoad) {
          that.handlePostLoadAdjustments();
        }

        // Fade in on the newly reconfigured scene
        that.fade('in', parent.id);
        return;
      }
    }, Utility.CHECK_OPACITY_RATE);
  };

  // Assembly functions

  /**
   * @description As its name implies, this function is used to construct an
   * individual instance of an element or object; in this case, it builds a
   * single HTML element that will be returned from the function and appended to
   * the DOM dynamically. It accepts an array of strings denoting the type of
   * element to create and also handles potentially nested element arrays for
   * elements that are to exist inside the outer element tags as inner HTML. In
   * many respects, this function is the most critical building block of the
   * module, as it use facilitates the generation of dynamic JS-mediated scenes
   * that can be built and added to the page without the need to fetch static
   * HTML files. The builder functions contained in this JS module are really
   * nothing more than heavy extended invocations of this function that pass
   * large frameworks of HTML for assembly herein.
   * <br />
   * <br />
   * An example of wellformed input is shown below:
   * <br />
   * <pre>
   * this.assembleElement(
   *   ['div', {id: 'foo-id', class: 'foo-class'},
   *     ['button', {id: 'bar-id', class: 'bar-class'},
   *       'Text',
   *     ],
   *   ],
   * );
   * </pre>
   *
   * @param {!Array<string>} paramArray Well-formed array representing DOM node
   * @returns {HTMLElement} element Assembled element for addition to DOM
   */
  inaccessible.assembleElement = function (paramArray) {

    // Declarations
    let element, name, attributes, counter, content;

    // Make sure input argument is a well-formatted array
    if (!this.isArray(paramArray)) {
      return this.assembleElement.call(this,
          Array.prototype.slice.call(arguments));
    }

    // Definitions
    name = paramArray[0];
    attributes = paramArray[1];
    element = document.createElement(name);
    counter = 1;

    /**
     * Note: We use <code>!=</code> here to check for both undefined and null
     * behavior since <code>attributes != null</code> is equivalent to
     * <code>attributes === undefined || attributes === null</code>.
     */
    if (typeof attributes === 'object' && attributes != null &&
        !this.isArray(attributes)) {

      for (let attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
      }

      counter = 2;
    }

    for (let i = counter; i < paramArray.length; i++) {

      // Check if recursive assembly is required for another inner DOM element
      if (this.isArray(paramArray[i])) {
        content = this.assembleElement(paramArray[i]);

      // Otherwise check if array element is already an assembled DOM element
      } else if (this.isElement(paramArray[i])) {
        content = paramArray[i];

      // Otherwise, treat any remaining array elements as text content
      } else {
        content = document.createTextNode(paramArray[i]);
      }

      // Add to outer parent element
      element.appendChild(content);
    }

    return element;
  };

  /**
   * @description This function is used as a super-specialized version of the
   * above assembly function <code>inaccessible.assembleElement</code> to build
   * button elements in the interface and their associated handler functions
   * that can be used for all manner of purposes, from opening new user modals
   * to transitioning between page scenes. The use of config options opens a lot
   * of customization doors and is pretty responsive to most button needs. The
   * specific button collections that use this function are the enums
   * <code>ModalButtons</code> and <code>ModuleButtons</code> and the arrays
   * <code>inaccessible.navlinksButtonData</code> and
   * <code>inaccessible.sidebarButtonData</code>, as discussed in their own
   * relevant inline documentation.
   * <br />
   * <br />
   * Button objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   buttonType: 'Button name',     // Text to appear on the button
   *   functionName: 'handler',       // Event listener/handler name
   *   functionArguments: [],         // Any arguments listener func needs
   *   requiresWrapper: false,        // Is button to be wrapped in a <div>?
   *   elementId: 'element-id',       // Element id (unique identifier)
   *   elementClasses: [
   *     'element-class-1',           // Array of element classes
   *   ],
   * },
   * </pre>
   *
   * @param {object} paramObject Config button object as seen above
   * @returns {HTMLElement} buttonElement Assembled button for addition to DOM
   */
  inaccessible.assembleButtonElement = function (paramObject) {

    // Declarations
    let that, tempName, classes, buttonHolderConfig, buttonConfig,
      buttonElement;

    // Definitions
    that = this;
    tempName = paramObject.buttonType;

    // Specific button config
    buttonConfig = {
      class: paramObject.elementClasses.join(' '),
      id: paramObject.elementId,
    };

    // Some buttons need an individual <div> wrapper
    if (paramObject.requiresWrapper) {
      buttonHolderConfig = {
        class: Identifiers.CLASS_GENERAL_BUTTONS_HOLDER,
      };

      buttonElement = this.assembleElement(
        ['div', buttonHolderConfig,
          ['button', buttonConfig, tempName],
        ],
      );
    } else {
      buttonElement = this.assembleElement(['button', buttonConfig, tempName]);
    }

    // Associated click handler
    buttonElement.addEventListener('click', function () {
      that[paramObject.functionName](...paramObject.functionArguments);
    }, false);

    // Return complete button/handler package
    return buttonElement;
  };

  /**
   * @description This builder is used to build the main part of the interface
   * dashboard scene, the HTML tables themselves. Additionally, it makes use of
   * a preformed array of <code>String</code>s in the construction of the table
   * headers. Originally, this function was named <code>assembleLedger</code> or
   * something to that effect, though this was change to the present upon the
   * team's choice to have multiple tables for multiple types of data. As such,
   * it is used in a variety of circumstances to create new HTML tables with
   * column counts determined by the number of headers included in the parameter
   * string array argument. It basically just creates the <code>table</code>
   * element and included <code>thead</code> and <code>tbody</code> child nodes
   * before determining the number of columns via the assembly of table headers.
   *
   * @param {!Array<string>} paramHeaders String array of table header nodes
   * @returns {HTMLElement} ledger The well-formed HTML table DOM element
   */
  inaccessible.assembleDashboardTable = function (paramHeaders) {

    // Declarations
    let ledger, thead, tbody, newRow, newCell, configRowHeader, configTable;

    // <table> config object
    configTable = {
      id: Identifiers.ID_DASHBOARD_WRAPPER,
      class: Identifiers.CLASS_GENERAL_ARIAL,
      style: 'table-layout: fixed;',
    };

    // <th> config object
    configRowHeader = {
      class: Identifiers.CLASS_DASHBOARD_LEDGER_TABLE_HEADER,
    };

    // Create ledger table
    ledger = this.assembleElement(['table', configTable]);

    // Create a thead and tbody for row differentiation
    thead = ledger.createTHead();
    tbody = ledger.appendChild(document.createElement('tbody'));

    // New first row
    newRow = thead.insertRow(0);

    // Create a new column cell for each header
    for (let i = 0; i < paramHeaders.length; i++) {
      newCell = newRow.insertCell(i);
      newCell.appendChild(
        this.assembleElement(['th', configRowHeader, paramHeaders[i]])
      );
    }

    return ledger;
  };

  /**
   * @description The final assembly function is used to create and return a new
   * dropdown option element for selection in an interaction modal. At the time
   * of writing, this function is used primarily in the addition of document
   * type options to the type selection menu, in the appending of extant
   * customers or vendors to the party selection menu in the same modal, and in
   * the addition of extant user-created accounts to the same modal's pseudo-row
   * <code>code</code> table cell. It accept as a sole argument a config object
   * with a <code>name</code> and <code>value</code> property denoting the text
   * to display in the <code>option</code> and the associated value to be passed
   * to the endpoint upon the user's selection of this option in the menu.
   * <br />
   * <br />
   * Dropdown option config objects are styled as seen below:
   * <br />
   * <pre>
   * paramObject = {
   *   name: 'Accounts payable invoice',
   *   value: 'API',
   * };
   * </pre>
   *
   * @param {object} paramObject Document type config object
   * @returns {HTMLElement} The assembled dropdown option element
   */
  inaccessible.assembleDropdownElement = function (paramObject) {
    return this.assembleElement('option', {
      value: paramObject.value,
      class: Identifiers.CLASS_MODAL_DROPDOWN_OPTION,
    }, paramObject.name);
  };

  // Builder functions

  /**
   * @description Replacing the previous JS module's
   * <code>inaccessible.buildLoginInterface</code> implementation, this function
   * and its pair of related inner content builders are responsible for the
   * construction of the login module interface, used to both login to an extant
   * account and to create a new account. This new implementation makes use of
   * the <code>inaccessible.tinderize</code> helper function to fade in and out
   * of the main body section of the module rather than replace the entire
   * scene with a new scene every time the user moves between the login module
   * and the create account module. This ensures that the module header does not
   * have to be removed and recreated every time.
   *
   * @param {HTMLElement} paramContent Mini-module HTML for addition to body
   * @returns {HTMLElement} Assembled login module
   */
  inaccessible.buildLoginModule = function (paramContent) {

    // Declarations
    let configContainer, configTopbar, configTopbarHolder, configTopbarTitle,
      configTopbarSubtitle, configMain;

    // Wrapper element
    configContainer = {
      id: Identifiers.ID_LOGIN_CONTAINER,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION + ' ' +
        Identifiers.CLASS_GENERAL_CONTAINER,
    };

    // <header> element
    configTopbar = {
      id: Identifiers.ID_LOGIN_TOPBAR,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    // Container for title and subtitle
    configTopbarHolder = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_HOLDER,
      class: Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING,
    };

    // "Keep Dem Books, Y'all"
    configTopbarTitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_TITLE,
      class: Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // "A bookkeeping application..."
    configTopbarSubtitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_SUBTITLE,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // Scene body
    configMain = {
      id: Identifiers.ID_LOGIN_MAIN,
    };

    // Set the scene flag
    this.scene = Scenes.LOGIN;

    // Return assembled framework
    return this.assembleElement(
      ['div', configContainer,
        ['header', configTopbar,
          ['div', configTopbarHolder,
            ['div', configTopbarTitle,
              Text.DIV_GENERAL_TOPBAR_TITLE,
            ],
            ['div', configTopbarSubtitle,
              Text.DIV_GENERAL_TOPBAR_SUBTITLE,
            ],
          ],
        ],
        ['main', configMain,
          paramContent
        ],
      ],
    );
  };

  /**
   * @description This builder function returns the prebuilt HTML framework for
   * the login module body. This framework is related to the logging into an
   * existing account, and thus contains fields for username and password as
   * well as buttons for submission of data and an "account creation" button for
   * new users to move to the account creation mini-module. As discussed in the
   * <code>inaccessible.buildLoginModule</code> function, this builder function
   * assembled the HTML that is then passed to the greater login module builder
   * to serve as its inner body content, making use of the transition function
   * <code>inaccessible.tinderize</code> to make the shift seemless. It accepts
   * as arguments an array of button object config from the enum
   * <code>ModuleButtons</code> that are assembled herein.
   *
   * @param {!Array<object>} paramButtons Array of <code>ModuleButtons</code>
   * @returns {HTMLElement} Assembled login module body content
   */
  inaccessible.buildLoginContent = function (paramButtons) {

    // Declarations
    let configContent, configBody, configBodyHeader, configBodyLoginHolder,
      configBodyLoginUsername, configBodyLoginPassword, configFooter,
      configButtonsHolder;

    // Wrapper for body content (<article>)
    configContent = {
      id: Identifiers.ID_LOGIN_CONTENT,
    };

    // <section> body
    configBody = {
      id: Identifiers.ID_LOGIN_BODY,
    };

    // Contains text summarizing the user's action
    configBodyHeader = {
      id: Identifiers.ID_LOGIN_BODY_HEADER,
      class: Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING + ' ' +
        Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // <form> element for input fields
    configBodyLoginHolder = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_HOLDER,
    };

    // Input field for usernames
    configBodyLoginUsername = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_USERNAME,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_USERNAME_PLACEHOLDER,
      type: 'text',
    };

    // Input field for passwords
    configBodyLoginPassword = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_PASSWORD,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    // <section> holder for buttons
    configFooter = {
      id: Identifiers.ID_LOGIN_FOOTER,
    };

    // Holder config
    configButtonsHolder = {
      id: Identifiers.ID_LOGIN_FOOTER_BUTTONS_HOLDER,
      class: Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

    // Return assembled HTML
    return this.assembleElement(
      ['article', configContent,
        ['section', configBody,
          ['div', configBodyHeader,
            Text.DIV_LOGIN_BODY_HEADER,
          ],
          ['form', configBodyLoginHolder,
            ['input', configBodyLoginUsername],
            ['input', configBodyLoginPassword],
          ],
        ],
        ['section', configFooter,
          this.buildButtonsListing(configButtonsHolder, paramButtons),
        ],
      ],
    );
  };

  /**
   * @description Like that above it, this function returns an HTML framework
   * for the login module interface, though this function's HTML is related to
   * the creation of a new account and is added to the module on presses of the
   * "Create account" button. As such, its content contains fields for the input
   * of new usernames and passwords as well as <code>ModuleButtons</code> for
   * returning to the login module and submitting new account data. As discussed
   * in the <code>inaccessible.buildLoginModule</code> documentation, this
   * builder returns an HTML mini-module that will serve as the body content of
   * the main login module without the need to recreate the entire scene on
   * each button press. It makes use of the transition utility function
   * <code>inaccessible.tinderize</code> to make the shift seemless. It accepts
   * as arguments an array of button object config from the enum
   * <code>ModuleButtons</code> that are assembled herein.
   *
   * @param {!Array<object>} paramButtons Array of <code>ModuleButtons</code>
   * @returns {HTMLElement} Assembled accoutn creation body mini-module
   */
  inaccessible.buildAccountCreationContent = function (paramButtons) {

    // Declarations
    let configContent, configBody, configBodyHeader, configBodyLoginHolder,
      configBodyLoginUsername, configBodyLoginPassword, configBodyLoginReenter,
      configFooter, configButtonsHolder;

    // <article> wrapper
    configContent = {
      id: Identifiers.ID_LOGIN_CONTENT,
    };

    // <section> content container
    configBody = {
      id: Identifiers.ID_LOGIN_BODY,
    };

    // <div> holder for operation text
    configBodyHeader = {
      id: Identifiers.ID_LOGIN_BODY_HEADER,
      class: Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING + ' ' +
        Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // <form> for the input textfields
    configBodyLoginHolder = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_HOLDER,
    };

    // Username input textfield
    configBodyLoginUsername = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_USERNAME,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_USERNAME_PLACEHOLDER,
      type: 'text',
    };

    // Password input textfield
    configBodyLoginPassword = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_PASSWORD,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    // Password reenter input textfield
    configBodyLoginReenter = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_REENTER,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_REENTER_PLACEHOLDER,
      type: 'password',
    };

    // <section> for buttons
    configFooter = {
      id: Identifiers.ID_LOGIN_FOOTER,
    };

    // Holder for assembled buttons
    configButtonsHolder = {
      id: Identifiers.ID_LOGIN_FOOTER_BUTTONS_HOLDER,
      class: Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

    // Return assembled accoutn creation mini-module
    return this.assembleElement(
      ['article', configContent,
        ['section', configBody,
          ['div', configBodyHeader,
            Text.DIV_LOGIN_BODY_HEADER,
          ],
          ['form', configBodyLoginHolder,
            ['input', configBodyLoginUsername],
            ['input', configBodyLoginPassword],
            ['input', configBodyLoginReenter],
          ],
        ],
        ['section', configFooter,
          this.buildButtonsListing(configButtonsHolder, paramButtons),
        ],
      ],
    );
  };

  /**
   * @description This builder function was the first of the builder functions
   * to be constructed upon the finalization of the application design, and was
   * primarily added as a test of the <code>inaccessible.assembleElement</code>
   * assembly function's reaction to heavily-nested HTML generation input. As
   * such, it retains its legacy name of <code>buildUserInterface</code> despite
   * the design paradigm's evolution since its inception. More properly, it
   * should perhaps be called <code>buildDashboardScene</code> or something more
   * to that effect.
   * <br />
   * <br />
   * Regardless, the function oversees the building of the dashboard scene, the
   * scene of the application used to display the data tables, sidebar buttons
   * collection, and navlinks topbar to the user. This scene represents the most
   * important scene of the program, as it is in this location that most of the
   * user's interactions with the program functionality occur. This function
   * builds the sidebar, topbar, all buttons, and the main table section,
   * creating the masthead text section in the table location informing the user
   * of the program's purpose and the identities of its authors.
   *
   * @returns {HTMLElement} The constructed dashboard page scene
   */
  inaccessible.buildUserInterface = function () {

    // Declarations
    let configContainer, configTopbar, configTopbarMeta, configTopbarMetaTitle,
      configTopbarMetaSubtitle, configTopbarNavLinks,
      configTopbarNavLinksHolder, configSection, configSidebar,
      configSidebarButtonContainer, configLedger, configLedgerTable;

    // Scene wrapper
    configContainer = {
      id: Identifiers.ID_DASHBOARD_CONTAINER,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION + ' ' +
        Identifiers.CLASS_GENERAL_CONTAINER,
    };

    // <header> element
    configTopbar = {
      id: Identifiers.ID_DASHBOARD_TOPBAR,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    // Container for text titles
    configTopbarMeta = {
      id: Identifiers.ID_DASHBOARD_TOPBAR_META,
      class: Identifiers.CLASS_GENERAL_TOPBAR_DIV,
    };

    // "Keep Dem Books, Y'all"
    configTopbarMetaTitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_TITLE,
      class: Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // "A bookkeeping application..."
    configTopbarMetaSubtitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_SUBTITLE,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // <div> for topbar holder and topbar navlink elements
    configTopbarNavLinks = {
      id: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS,
      class: Identifiers.CLASS_GENERAL_TOPBAR_DIV,
    };

    // Holder/wrapper for navlink element collection
    configTopbarNavLinksHolder = {
      id: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_HOLDER,
    };

    // <section> for main table section and sidebar (everything south of topbar)
    configSection = {
      id: Identifiers.ID_DASHBOARD_SECTION,
      class: Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

    // Sidebar <aside> semantic tag
    configSidebar = {
      id: Identifiers.ID_DASHBOARD_SIDEBAR,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    // Wrapper config for sidebar buttons holder
    configSidebarButtonContainer = {
      id: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS,
    };

    // Legacy name for the table/masthead <main> section
    configLedger = {
      id: Identifiers.ID_DASHBOARD_LEDGER,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    // Define scene flag
    this.scene = Scenes.DASHBOARD;

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['header', configTopbar,
          ['div', configTopbarMeta,
            ['div', configTopbarMetaTitle,
              Text.DIV_GENERAL_TOPBAR_TITLE,
            ],
            ['div', configTopbarMetaSubtitle,
              Text.DIV_GENERAL_TOPBAR_SUBTITLE,
            ],
          ],
          ['div', configTopbarNavLinks,
            this.buildButtonsListing(configTopbarNavLinksHolder,
              this.navlinksButtonData),
          ],
        ],
        ['section', configSection,
          ['aside', configSidebar,
            this.buildButtonsListing(configSidebarButtonContainer,
              this.sidebarButtonData),
          ],
          ['main', configLedger,
            this.buildMasthead(),
          ],
        ],
      ],
    );
  };

  /**
   * @description This builder function constructs the informative masthead
   * module that is built on the user's login to the application. This module
   * displays information related to the application's essential functions and
   * a brief summary of the authors and their associated teams. It is replaced
   * upon the loading of a new table via the sidebar buttons and does not appear
   * again until the user logs out and logs back in. This builder represents the
   * last scene/mini-scene developed by the front-end JavaScript engineer, and
   * was added at the last minute to fill the void that exists on the log into
   * the application as a new user without any created documents, accounts,
   * vendors, or customers. In order to fill this out, the empty documents table
   * that previously greeted new users was replaced with this masthead.
   *
   * @returns {HTMLElement} The assembled masthead mini-scene
   */
  inaccessible.buildMasthead = function () {

    // Declarations
    let configContainer, configHeader, configHeaderTitle, configMain,
      configMainAbout, configMainAboutTitle, configMainAboutText,
      configMainAuthors, configMainAuthorsTitle, configMainAuthorsText;

    // Mini-scene wrapper
    configContainer = {
      id: Identifiers.ID_DASHBOARD_WRAPPER,
    };

    // <header> for <h2> element
    configHeader = {
      id: Identifiers.ID_MASTHEAD_HEADER,
    };

    // <h2> element for overview title
    configHeaderTitle = {
      id: Identifiers.ID_MASTHEAD_HEADER_TITLE,
      class: Identifiers.CLASS_MASTHEAD_H2 + ' ' +
        Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // <main> tag containing the bulk of the text content
    configMain = {
      id: Identifiers.ID_MASTHEAD_MAIN,
    };

    // About the application section
    configMainAbout = {
      id: Identifiers.ID_MASTHEAD_MAIN_ABOUT,
      class: Identifiers.CLASS_MASTHEAD_SECTION,
    };

    // <h3> title for About section
    configMainAboutTitle = {
      id: Identifiers.ID_MASTHEAD_MAIN_ABOUT_TITLE,
      class: Identifiers.CLASS_MASTHEAD_H3 + ' ' +
        Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // Text content of the About section
    configMainAboutText = {
      id: Identifiers.ID_MASTHEAD_MAIN_ABOUT_TEXT,
      class: Identifiers.CLASS_MASTHEAD_TEXT_CONTAINER,
    };

    // Authors of the application section
    configMainAuthors = {
      id: Identifiers.ID_MASTHEAD_MAIN_AUTHORS,
      class: Identifiers.CLASS_MASTHEAD_SECTION,
    };

    // <h3> title for Authors section
    configMainAuthorsTitle = {
      id: Identifiers.ID_MASTHEAD_MAIN_AUTHORS_TITLE,
      class: Identifiers.CLASS_MASTHEAD_H3 + ' ' +
        Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // Text content of the Authors section
    configMainAuthorsText = {
      id: Identifiers.ID_MASTHEAD_MAIN_AUTHORS_TEXT,
      class: Identifiers.CLASS_MASTHEAD_TEXT_CONTAINER,
    };

    // Define scene flag (just in case)
    this.scene = Scenes.DASHBOARD;

    // Return assembled mini-scene
    return this.assembleElement(
      ['div', configContainer,
        ['header', configHeader,
          ['h2', configHeaderTitle,
            Text.MASTHEAD_HEADER_TITLE,
          ],
        ],
        ['main', configMain,
          ['section', configMainAbout,
            ['h3', configMainAboutTitle,
              Text.MASTHEAD_ABOUT_HEADER,
            ],
            ['div', configMainAboutText,
              Text.MASTHEAD_ABOUT_TEXT,
            ],
          ],
          ['section', configMainAuthors,
            ['h3', configMainAuthorsTitle,
              Text.MASTHEAD_AUTHORS_HEADER,
            ],
            ['div', configMainAuthorsText,
              Text.MASTHEAD_AUTHORS_TEXT,
            ],
          ],
        ],
      ],
    );
  };

  /**
   * @description This builder function is used to build the popup modal
   * framework to which additional inner HTML skeletons can be attached as
   * needed for various functions. Each modal will be appended to the body tag,
   * with the rest of the page content hidden slightly behind a black opaque
   * screen that directs focus to the modal. The modal has a specific title and
   * a set of interaction buttons at the bottom that will allow the user to
   * close the modal, submit data, or attempt several other different tasks as
   * required by the specific modal being viewed.
   * <br />
   * <br />
   * The design of this modal is intentionally similar to that employed by
   * <code>inaccessible.buildLoginModule</code>, namely accepting mini-scene
   * input as body content to be appended to the greater scene framework. This
   * framework builder is responsible for building the overall skeleton of the
   * modal, with specific inner content being determined by the modal requested
   * by the user by way of the sidebar/navlink interface button pressed. This
   * ensures all modals share a similar aesthetic while allowing for differences
   * in body content and the types of buttons present in the modal footer.
   *
   * @param {string} paramTitle Modal title for the modal header
   * @param {HTMLElement} paramContent Inner HTML body content
   * @param {!Array<object>} paramButtons Array of button config objects
   * @returns {HTMLElement} The assembled modal framework
   */
  inaccessible.buildModal = function (paramTitle, paramContent, paramButtons) {

    // Declarations
    let that, button, configBlackout, configModal, configHeader,
      configHeaderTitle, configSection, configFooter, configFooterButtons;

    // Preserve scope
    that = this;

    // Opaque black background commanding focus on modal
    configBlackout = {
      id: Identifiers.ID_MODAL_BLACKOUT,
    };

    // Module <div>
    configModal = {
      id: Identifiers.ID_MODAL_MAIN,
    };

    // Title and nothing else
    configHeader = {
      id: Identifiers.ID_MODAL_HEADER,
      class: Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Span wrapper for title text
    configHeaderTitle = {
      id: Identifiers.ID_MODAL_HEADER_TITLE,
      class: Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // Empty main section to which mini-scenes will be appended
    configSection = {
      id: Identifiers.ID_MODAL_SECTION,
      class: Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // <footer> for buttons
    configFooter = {
      id: Identifiers.ID_MODAL_FOOTER,
      class: Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Container for the footer buttons
    configFooterButtons = {
      id: Identifiers.ID_MODAL_FOOTER_BUTTONS,
    };

    // Define scene flag
    this.scene = Scenes.MODAL;

    // Return assembled interface
    return this.assembleElement(
      ['div', configBlackout,
        ['main', configModal,
          ['header', configHeader,
            ['div', configHeaderTitle,
              paramTitle,
            ],
          ],
          ['section', configSection,
            paramContent,
          ],
          ['footer', configFooter,
            this.buildButtonsListing(configFooterButtons, paramButtons),
          ],
        ],
      ],
    );
  };

  /**
   * @description This simple modal is used to render simply text-only modals on
   * the screen as a dynamic way of alerting the user to success or failure
   * operations in a manner similar to the module/modal-based status notice
   * approach. This is primarily used to inform the user of an empty table of
   * vendors, customers, documents, or accounts in the event that the user has
   * pressed the related sidebar button prior to populating the appropriate
   * table with extant entries. In such cases, this modal will be displayed with
   * an appropriate message indicating that the user should create some entries
   * prior to pressing the button.
   *
   * @param {string} paramMessage Plain text message to display as body
   * @returns {HTMLElement} The completed text-only modal
   */
  inaccessible.buildPlainModal = function (paramMessage) {

    let configContainer, configInformation;

    // <div> container
    configContainer = {
      id: Identifiers.ID_DEFAULT_CONTAINER,
    };

    // <div> wrapper for text content
    configInformation = {
      id: Identifiers.ID_DEFAULT_INFORMATION,
    };

    // Define scene flag
    this.scene = Scenes.MODAL;

    // Return completed modal body
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          paramMessage,
        ]
      ],
    );
  };

  /**
   * @description This builder function is responsible for building the modal
   * mini-scene related to the password changing process. It assembles a bit of
   * HTML including a pair of password entry input textfields and a set of
   * wrapper container divs and some text instructing the user to enter matched
   * passwords. This modal mini-scene in particular is constructed when the
   * user presses the "Change password" navlinks button of the topbar dashboard
   * section, the only navlinks button that opens a modal. Its associated
   * submission event handler is <code>inaccessible.handlePasswordChange</code>,
   * used to pass new password information to the database.
   *
   * @returns {HTMLElement} The assembled password change mini-scene
   */
  inaccessible.buildPasswordChangeModal = function () {

    // Declarations
    let configContainer, configInformation, configInputForm,
      configInputPassword, configInputPasswordReentered;

    // <div> wrapper
    configContainer = {
      id: Identifiers.ID_CHANGEP_CONTAINER,
    };

    // Information text wrapper <div>
    configInformation = {
      id: Identifiers.ID_CHANGEP_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // <form> element for input fields
    configInputForm = {
      id: Identifiers.ID_CHANGEP_FORM,
    };

    // Password input field
    configInputPassword = {
      id: Identifiers.ID_CHANGEP_INPUT_PASSWORD,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CHANGEP_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    // Password reenter input field
    configInputPasswordReentered = {
      id: Identifiers.ID_CHANGEP_INPUT_REENTER,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CHANGEP_REENTER_PLACEHOLDER,
      type: 'password',
    };

    // Define scene flag
    this.scene = Scenes.MODAL;

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          Text.DIV_CHANGEP_INFORMATION,
        ],
        ['form', configInputForm,
          ['input', configInputPassword],
          ['input', configInputPasswordReentered],
        ],
      ],
    );
  };

  /**
   * @description This builder is not unlike that above it, namely
   * <code>inaccessible.buildPasswordChangeModal</code>, as it possesses a form
   * element with two textfields. These textfields are related to the vendor or
   * customer name and address. This mini-scene creation function is used by
   * both the "Add new customer" and "Add new vendor" sidebar buttons to build a
   * modal body as both those operations are nearly identical, thus reducing the
   * need for a duplicate copy/pasted builder for each. The related submission
   * handler is <code>inaccessible.handleCustomerOrVendorAddition</code>, which
   * takes the input from the textfields, validates it, and passes it to the
   * database as a new party entry.
   *
   * @returns {HTMLElement} The assembled party input modal content
   */
  inaccessible.buildCustomerOrVendorAdditionModal = function () {

    // Declarations
    let configContainer, configInformation, configInputForm,
      configInputName, configInputAddress;

    // <div> wrapper for modal body content
    configContainer = {
      id: Identifiers.ID_CORV_CONTAINER,
    };

    // Text holder <div>
    configInformation = {
      id: Identifiers.ID_CORV_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // <form> element for textfields
    configInputForm = {
      id: Identifiers.ID_CORV_FORM,
    };

    // Input textfield for name
    configInputName = {
      id: Identifiers.ID_CORV_INPUT_NAME,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CORV_NAME_PLACEHOLDER,
      type: 'text',
    };

    // Input textfield for address
    configInputAddress = {
      id: Identifiers.ID_CORV_INPUT_ADDRESS,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CORV_ADDRESS_PLACEHOLDER,
      type: 'text',
    };

    // Define scene flag
    this.scene = Scenes.MODAL;

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          Text.DIV_CORV_INFORMATION,
        ],
        ['form', configInputForm,
          ['input', configInputName],
          ['input', configInputAddress],
        ],
      ],
    );
  };

  /**
   * @description This builder function is responsible for the construction of
   * the modal mini-scene related to the addition of a new document. It builds a
   * pair of dropdown menus that allow the user to select document type and a
   * vendor or customer to which this new document is to be associated. Much of
   * the second dropdown's contents are built by another handler that assembles
   * a listing of extant parties depending on the option selected for the doc
   * type dropdown. Below these dropdowns is the document general ledger entries
   * pseudo-HTML table, containing rows of mini-dropdowns and input textfields
   * related to the specific document transaction entries that will be displayed
   * upon selection of the document in the interface. Users can add and remove
   * specific rows through the use of the footer buttons included for these
   * purposes.
   * <br />
   * <br />
   * All this user-input data is then collected and collated by the handler
   * <code>inaccessible.handleDocumentAddition</code> before being sent to the
   * database and registered as a new document.
   *
   * @returns {HTMLElement} The assembled document addition modal body content
   */
  inaccessible.buildDocumentAdditionModal = function () {

    // Declarations
    let that, configContainer, configInformation, configTypeDropdown,
      configTypeDropdownOption, configPartyDropdown, configPartyDropdownOption,
      typeDropdown, typeDropdownOption, configDropdownHolder, configDocName,
      configDocNameHolder, configEntriesHolder, configEntriesForm;

    // Preserve scope
    that = this;

    // <div> container for the modal content
    configContainer = {
      id: Identifiers.ID_DOCUMENT_CONTAINER,
    };

    // Holder for the informative text
    configInformation = {
      id: Identifiers.ID_DOCUMENT_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // Holder for the document name input
    configDocNameHolder = {
      id: Identifiers.ID_DOCUMENT_INPUT_NAME_HOLDER,
    };

    // Input textfield for the name element
    configDocName = {
      id: Identifiers.ID_DOCUMENT_INPUT_NAME,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_DOCUMENT_NAME_PLACEHOLDER,
      type: 'text',
    };

    // <div> holder for the dropdown menus
    configDropdownHolder ={
      id: Identifiers.ID_DOCUMENT_DROPDOWN_HOLDER,
    };

    // Dropdown for document type
    configTypeDropdown = {
      id: Identifiers.ID_DOCUMENT_DROPDOWN_TYPE,
      class: Identifiers.CLASS_MODAL_DROPDOWN,
    };

    // Dropdown for customer/vendor, depending on type
    configPartyDropdown = {
      id: Identifiers.ID_DOCUMENT_DROPDOWN_PARTY,
      class: Identifiers.CLASS_MODAL_DROPDOWN,
    };

    // Default option for this dropdown
    configPartyDropdownOption = {
      id: Identifiers.ID_DOCUMENT_DROPDOWN_OPTION + '-default',
      class: Identifiers.CLASS_MODAL_DROPDOWN_OPTION,
    };

    // Holder for <form> pseudo-table
    configEntriesHolder = {
      id: Identifiers.ID_DOCUMENT_TABLE_HOLDER,
    };

    // <form> table for the pseudo-rows
    configEntriesForm = {
      id: Identifiers.ID_DOCUMENT_TABLE,
    };

    // Define scene flag
    this.scene = Scenes.MODAL;

    /**
     * This <code>if</code> statement block is used to determine whether or not
     * to clear the <code>inaccessible</code> scope object property
     * <code>userAccounts</code>, used to store data related to the user's
     * extant accounts (1000 - Cash, etc.). If it exists and it is populated,
     * this is an indication that the user A) created a set of accounts and B)
     * opened the add document module before. Since we can't know for certain if
     * the user added a new account in the interim since last opening the doc
     * modal, we have to clear the array and thus in so doing inform
     * <code>inaccessible.buildDocumentAdditionTableRow</code> that it should
     * query the database for an updated listing of the user's accounts prior to
     * populating the relevant accounts row dropdown with entries.
     */
    if (this.userAccounts != null && this.userAccounts.length) {
      this.userAccounts = [];
    }

    // Document type dropdown menu element
    typeDropdown = this.assembleElement(['select', configTypeDropdown]);

    /**
     * This listener attached to changes of the document type dropdown menu is
     * used to invoke <code>inaccessible.handleDocumentDropdownChange</code>,
     * which serves to ensure that the parties populating the relevant dropdown
     * are related to the type of document to be created by the user.
     */
    typeDropdown.addEventListener('change', function () {
      that.handleDocumentDropdownChange.call(that, typeDropdown);
    }, false);

    // Create dropdown options for each of the five supported document types
    this.displayTypesDropdownElements('DOCUMENT', typeDropdown);

    // Return assembled modal body
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          Text.DIV_DOCUMENT_INFORMATION,
        ],
        ['div', configDocNameHolder,
          ['input', configDocName],
        ],
        ['div', configDropdownHolder,
          typeDropdown,
          ['select', configPartyDropdown,
            ['option', configPartyDropdownOption,
              Text.INPUT_DOCUMENT_PARTY_OPTION,
            ],
          ],
        ],
        ['div', configEntriesHolder,
          ['form', configEntriesForm,
            this.buildDocumentAdditionTableRow(),
          ],
        ],
      ],
    );
  };

  /**
   * @description This builder function is used to construct the framework of a
   * new pseudo-table row for the ledger transactions entry table included in
   * the documents addition modal. Originally, the author tried an HTML table-
   * based approach, but eventually replaced this with a simple
   * <code>form</code>-powered version, wherein rows are simply groups of input
   * elements like dropdown menus and input textfields bound within a containing
   * <code>div</code>. The author still thinks a proper HTML table would have
   * been a bit easier to style, but thanks to his related CSS styling and the
   * efforts of the CSS team, the <code>div</code> and its contents were made
   * to appear similar to a proper table row.
   * <br />
   * <br />
   * As discussed in more detail in the relevant block comment in the body of
   * the function itself, this function makes use of a bit of janky caching
   * functionality to store the queried account data returned from the back-end
   * once for subsequent use in addition table pseudo-rows as needed. By calling
   * for accounts only once, the values can be stored in an object property
   * variable of the <code>inaccessible</code> scope object and reused, thus
   * limiting the number of required calls and speeding up the process of
   * building rows. The author acknowledges that this could have also beend done
   * via the use of <code>localStorage</code> or a session cookie.
   *
   * @returns {HTMLElement} The assembled pseudo-row for addition to the modal
   */
  inaccessible.buildDocumentAdditionTableRow = function () {

    // Declarations
    let that, data, configWrapper, configDelete, configCodeDropdown, configDate,
      configCodeDropdownOption, configCredebitDropdown, codeDropdown,
      codeDropdownDefault, codeDropdownOption, configAmount, configDescription,
      configCredebitDropdownOptionCredit, configCredebitDropdownOptionDebit;

    // Preserve scope
    that = this;

    // <div> wrapper for the row
    configWrapper = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_WRAPPER,
    };

    // Mini-row deletion checkbox
    configDelete = {
      type: 'checkbox',
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    // Dropdown menu for account codes (originally a textfield)
    configCodeDropdown = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_DROPDOWN,
    };

    // Dropdown menu default entry
    configCodeDropdownOption = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    // Input textfield for the date string
    configDate = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_DATE_PLACEHOLDER,
      type: 'text',
    };

    // Dropdown menu for credit or debit options
    configCredebitDropdown = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_DROPDOWN,
    };

    // Dropdown menu option for credit
    configCredebitDropdownOptionCredit = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    // Dropdown menu option for debit
    configCredebitDropdownOptionDebit = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    // Amount of money for this entry (xxxx.xx)
    configAmount = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_AMOUNT_PLACEHOLDER,
      type: 'text',
    };

    // Brief memo description of entry
    configDescription = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_DESCRIPTION_PLACEHOLDER,
      type: 'text',
    };

    /**
     * This code creates a new code dropdown and default entry and adds the
     * entry to menu. It replaces the original implementation, which displayed
     * the code as simply an input textfield that would require the user to
     * include a proper account code. Rather than trust the user to know the
     * codes by heart, the use of a dropdown was chosen as it remove the
     * possibility of malformed input being passed server-side.
     */
    codeDropdown = this.assembleElement('select', configCodeDropdown);
    codeDropdownDefault = this.assembleElement('option',
      configCodeDropdownOption, Text.INPUT_DOCUMENT_OPTION_CODE);
    codeDropdown.appendChild(codeDropdownDefault);

    /**
     * This <code>if...else</code> statement block is used to populate the
     * account code dropdown menus with entries related to the user's accounts.
     * Since the user cannot add a new account while in the document addition
     * modal, a single request for user accounts is all that is needed to
     * populate the dropdowns of multiple new pseudo-rows. The data from the
     * first request is stored as an <code>inaccessible</code> property array
     * named <code>userAccounts</code> which is used by subsequent dropdown
     * pseudo-rows to create new dropdown elements. Its contents are cleared on
     * the creation of a new documents modal to deal with cases wherein the user
     * may have added a new account since last opening the doc modal.
     */
    if (this.userAccounts == null || !this.userAccounts.length) {
      this.userAccounts = [];

      this.sendRequest(
        'GET',
        (TESTING)
          ? 'json/get_accounts.json'
          : 'php/get_accounts.php',
      ).then(function (response) {

        // Parse the JSON response into a usable object
        data = JSON.parse(response);

        if (DEBUG) {
          console.log(data);
        }

        if (data.success) {
          that.userAccounts = data.accounts;
          that.displayAccountDropdownElements(codeDropdown);
        }
      }, function (error) {
        console.warn(error);
        that.displayStatusNotice(false, Text.ERROR_NETWORK);
      });
    } else {
      this.displayAccountDropdownElements(codeDropdown);
    }

    // Return new pseudo-row
    return this.assembleElement(
      ['div', configWrapper,
        ['input', configDelete],
        codeDropdown,
        ['input', configDate],
        ['select', configCredebitDropdown,
          ['option', configCredebitDropdownOptionCredit,
            Text.INPUT_DOCUMENT_OPTION_CREDIT,
          ],
          ['option', configCredebitDropdownOptionDebit,
            Text.INPUT_DOCUMENT_OPTION_DEBIT,
          ],
        ],
        ['input', configAmount],
        ['input', configDescription],
      ],
    );
  };

  /**
   * @description This builder is built according to the framework provided by
   * the builder <code>inaccessible.buildCustomerOrVendorAdditionModal</code>.
   * It handles the construction of the modal body of the popup window
   * associated with the "Add account" sidebar button. In addition to a pair of
   * input textfields in a <code>form</code> used to pass the new account's
   * numerical code and associated text name, the modal also contains a dropdown
   * menu allowing the user to choose the type of account with which this new
   * account instance will be associated (Asset, liability, etc.). This dropdown
   * menu is dynamically populated through the use of the display function
   * <code>inaccessible.displayTypesDropdownElements</code> to build options
   * representing the five possible account types.
   *
   * @returns {void}
   */
  inaccessible.buildAccountAdditionModal = function () {

    // Declarations
    let that, configContainer, configInformation, configInputHolder,
      configInputForm, configInputCode, configInputName, configDropdownHolder,
      configTypeDropdown, typeDropdown;

    // Preserve scope
    that = this;

    // Modal body wrapper
    configContainer = {
      id: Identifiers.ID_ADDACC_CONTAINER,
    };

    // Wrapper <div> for account addition info text
    configInformation = {
      id: Identifiers.ID_ADDACC_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // Holder for <form> and input fields
    configInputHolder= {
      id: Identifiers.ID_ADDACC_INPUT_HOLDER,
    };

    // <form> holder for input textfields
    configInputForm = {
      id: Identifiers.ID_ADDACC_FORM,
    };

    // Input textfield for account code (1000, etc.)
    configInputCode = {
      id: Identifiers.ID_ADDACC_INPUT_CODE,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_ADDACC_CODE_PLACEHOLDER,
      type: 'text',
    };

    // Input textfield for account name
    configInputName = {
      id: Identifiers.ID_ADDACC_INPUT_NAME,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_ADDACC_NAME_PLACEHOLDER,
      type: 'text',
    };

    // <div> wrapper for the account type dropdown
    configDropdownHolder ={
      id: Identifiers.ID_ADDACC_DROPDOWN_HOLDER,
    };

    // Config for the account type dropdown
    configTypeDropdown = {
      id: Identifiers.ID_ADDACC_DROPDOWN_TYPE,
      class: Identifiers.CLASS_MODAL_DROPDOWN,
    };

    // Build new account type dropdown element
    typeDropdown = this.assembleElement(['select', configTypeDropdown])

    // Build all five account type options for dropdown
    this.displayTypesDropdownElements('ACCOUNT', typeDropdown);

    // Define scene flag
    this.scene = Scenes.MODAL;

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          Text.DIV_ADDACC_INFORMATION,
        ],
        ['div', configInputHolder,
          ['form', configInputForm,
            ['input', configInputCode],
            ['input', configInputName],
          ],
        ],
        ['div', configDropdownHolder,
          typeDropdown,
        ],
      ],
    );
  };

  /**
   * @description This parameter-accepting builder function is simply used to
   * indicate to the user whether or not the default account creation process
   * undertaken by means of presses to the "Add default accounts" button was
   * successful or unsuccessful. The manner in which the author saw fit to
   * implement this functionality is admittedly a little bit suspect, especially
   * given the fact that the modal framework was never developed to serve as a
   * status notice popup like <code>window.alert</code> or others styled like
   * it. This builder assembles a modal window body whose content depends on
   * whether or not the user has created new accounts successfully or if these
   * default accounts have already been created in the past.
   *
   * @param {!Array<object>} paramAccountsAdded Listing of added user accounts
   * @returns {HTMLElement} The modal body framework
   */
  inaccessible.buildDefaultAccountsModal = function (paramAccountsAdded) {

    // Declarations
    let that, accountsListHolder, accountsList, accountListElement,
      singleAccountSummary, configContainer, configInformation,
      configListHolder, configList, configListElement, success;

    // Preserve scope
    that = this;

    // Boolean flag to determine what content to show
    success = false;

    // Modal body container
    configContainer = {
      id: Identifiers.ID_DEFAULT_CONTAINER,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    // Modal text wrapper
    configInformation = {
      id: Identifiers.ID_DEFAULT_INFORMATION,
    };

    // <ul> list wrapper element
    configListHolder = {
      id: Identifiers.ID_DEFAULT_LIST_HOLDER,
    };

    // The <ul> itself, used to display new account entries
    configList = {
      id: Identifiers.ID_DEFAULT_LIST,
    };

    // Individual <li> list elements
    configListElement = {
      class: Identifiers.CLASS_DEFAULT_LIST_ELEMENT,
    };

    // If defaults were added successfully, this array will be populated
    if (paramAccountsAdded != null && paramAccountsAdded.length) {

      // Set boolea to true
      success = true;

      // Build unordered list and its holder
      accountsListHolder = this.assembleElement(['div', configListHolder]);
      accountsList = this.assembleElement(['ul', configList]);

      /**
       * Here, we create a new list element for each account added, taking a
       * template string from the <code>Text</code> enum containing replaceable
       * fragments like <code>#1</code> and <code>#2</code> and replacing these
       * fragments with account properies from the JSON response.
       */
      paramAccountsAdded.forEach(function (account) {
        singleAccountSummary = that.replaceAll(Text.DIV_DEFAULT_SUMMARY, {
          '#1': account.code,                 // 1000
          '#2': account.name,                 // Cash
          '#3': account.type.toLowerCase(),   // ASSET
        });

        // Add a new <li> element containing the modified template text string
        accountsList.appendChild(
          that.assembleElement(['li', configListElement, singleAccountSummary])
        );
      });

      // Add completed list to holder
      accountsListHolder.appendChild(accountsList);
    }

    // Return completed modal body (Only display list if success flag is true)
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          Text[`DIV_DEFAULT_INFORMATION_${(success) ? 'SUCCESS' : 'FAILURE'}`],
        ],
        (success) ? accountsListHolder : '',
      ],
    );
  };

  /**
   * @description This function is used to build one of the user-selected HTML
   * tables in the dashboard, either the documents overview table, the vendor or
   * customer tables, the accounts table, or the general ledger table. It works
   * by assembling a new table, adding rows listed in <code>paramRows</code>,
   * and finally returning the table to be appended by the fading utility
   * function <code>inaccessible.tinderize</code>. If the table required is the
   * documents overview table, a few further adjustments are made to the
   * <code>type</code> thereof, translating its initials into a human-friendly,
   * readable format (i.e. "JE" into "Journal entry"). This is done to ensure
   * that the table is as understandable at a glance as possible.
   * <br />
   * <br />
   * Originally, this function (and the greater application in general) made use
   * of a dedicated headers enum called <code>TableHeaders</code> that contained
   * string representations of the header titles to be shown in the HTML tables.
   * However, this approach was eventually removed in favor of simply adjusting
   * the returned JSON data object property keys via the new utility function
   * <code>inaccessible.convertKeyToHeader</code> and using their values as the
   * table headers, thus removing a largely redundant enum from use.
   *
   * @param {object} paramTableConfig Config options for the <code>table</code>
   * @param {!Array<object>} paramRows Array of table rows
   * @returns {HTMLElement} newTable The completed HTML table element framework
   */
  inaccessible.buildTable = function (paramTableConfig, paramRows) {

    // Declarations
    let that, newTable, headers;

    // Preserve scope
    that = this;

    // New headers array from JSON object keys
    headers = [];

    // First element is always deletion checkbox
    headers.push(Text.DIV_GENERAL_TABLE_HIDE_CHECKBOX);

    // Construct headers by means of JSON object property key names
    Object.keys(paramRows[0]).forEach(function (key) {
      headers.push(that.convertKeyToHeader(key));
    });

    // Create new table using converted property table headers
    newTable = this.assembleDashboardTable(headers);

    /**
     * This <code>if</code> statement block and associated <code>for/in</code>
     * loop serve to translate the various document code abbreviations into
     * their full names. For instance, the back-end lists various documents by
     * initials, i.e. <code>JE</code> for "Journal entry." This block translates
     * those initials back to a human-friendly type description for future
     * display in the table row.
     */
    if (paramTableConfig.name === 'documents') {
      for (let row in paramRows) {
        paramRows[row].documentType =
          Types.DOCUMENT[paramRows[row].documentType];
      }
    }

    // Add a new table row for each of the included rows in paramRows
    paramRows.forEach(function (row) {
      that.displayTableRow(row, newTable, paramTableConfig);
    });

    // Define scene flag
    this.scene = Scenes.DASHBOARD;

    return newTable;
  };

  /**
   * @description This simple builder function was designed specifically as a
   * fast, convenient way of assembling a wrapper <code>div</code> and the
   * buttons denoted in one of the script-global namespace arrays, either
   * <code>inaccessible.sidebarButtonData</code> or the related
   * <code>inaccessible.navlinksButtonData</code>. However, its use was further
   * expanded to the modal scene department as well, and is used within the main
   * modal framework function <code>inaccessible.buildModal</code> to assemble
   * the <code>footer</code>-bound buttons related to closing the modal,
   * clearing input fields, or submitting data, among other such operations as
   * required. The function itself simply builds a <code>div</code> and a set
   * of buttons from config object stored in the <code>paramButtons</code> array
   * and returns their conjoined contents.
   *
   * @param {object} paramConfig This object contains attributes for wrapper
   * @param {!Array<object>} paramButtons The script-global array
   * @returns {HTMLElement} buttonHolder The constructed buttons listing
   */
  inaccessible.buildButtonsListing = function (paramConfig, paramButtons) {

    // Declarations
    let that, buttonHolder;

    // Preserve scope
    that = this;

    // Assemble <div> holder element
    buttonHolder = this.assembleElement(['div', paramConfig]);

    // Create new button instance and add to wrapper
    paramButtons.forEach(function (button) {
      buttonHolder.appendChild(that.assembleButtonElement(button));
    });

    // Return wrapper and buttons combo
    return buttonHolder;
  };

  // Display functions

  /**
   * @description As per the standard usage of display functions, this function
   * is responsible for building a modal scene and adding it to the DOM rather
   * than returning it from the function. It also determines what buttons are
   * shown in the footer of the modal, the number and type of which are
   * determined by the inclusion of an optional <code>paramHandlerName</code>
   * string denoting the custom submission button press event handler used to
   * collate and transmit user data to the back-end. If no such parameter is
   * included, only the close modal button is included in the footer as the
   * primary means by which the modal is closed (though clicking outside the
   * window works as well as per the event listener below).
   * <br />
   * <br />
   * The display function works by first building the modal's desired inner body
   * content, be that content related to document addition, vendor addition, or
   * whatever the case may be. Secondly, the footer buttons required for
   * inclusion are determined, drawn from the parameter button array in addition
   * to default buttons like a submission button in certain cases and a close
   * modal button in all cases. Finally, once the buttons are collected and the
   * body content returned, these (in addition to the desired modal title) are
   * passed to the builder <code>inaccessible.buildModal</code>, with the
   * returned modal content then appended to the DOM. An event listener is then
   * added to ensure clicks outside the window are interpreted as the user's
   * attempts to close the modal.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {string} paramModalTitle Modal title to be displayed in the header
   * @param {object} paramBuilder Contains builder function & optional args
   * @param {!Array<object>=} paramButtonsArray Optional buttons array
   * @param {!string=} paramHandlerName The optional submission handler string
   * @returns {void}
   */
  inaccessible.displayModal = function (paramModalTitle, paramBuilder,
      paramButtonsArray = [], paramHandlerName = null) {

    // Declarations
    let that, innerContent, submitButtonCopy, buttons, modal, modalMain;

    // Preserve scope
    that = this;

    // Inner modal mini-scene content
    innerContent = this[paramBuilder.name](
          ...(paramBuilder.args != null) ? paramBuilder.args : []);

    // Define array for button config objects
    buttons = [];

    // If an input handler exists, we will need to add a submit button
    if (paramHandlerName != null) {

      // Make shallow copy of default submit button config
      submitButtonCopy = this.extend({}, ModalButtons.SUBMIT);

      // Adjust handler function String representation in submit button config
      submitButtonCopy.functionName = paramHandlerName;

      // Add this button to the required buttons array
      buttons.push(submitButtonCopy);
    }

    // Add extra buttons b/w submit & close buttons if param array is not empty
    if (paramButtonsArray.length > 0) {
      paramButtonsArray.forEach(function (button) {
        buttons.push(button);
      });
    }

    // Modal close button must always be present in all modals at the footer end
    buttons.push(ModalButtons.CLOSE);

    // Build modal using title, inner modal body content, and buttons array
    modal = this.buildModal(paramModalTitle, innerContent, buttons);

    // Add event listener for clicks outside main modal window
    modal.addEventListener('click', function handleOutsideClicks (event) {

      // Modal window itself (not blackout window)
      modalMain = document.getElementById(Identifiers.ID_MODAL_MAIN);

      if (modalMain == null || !modalMain.contains(event.target)) {
        if (modalMain != null) {
          that.handleModalClose();
        }

        // No need for extraneous listener post-close
        modal.removeEventListener('click', handleOutsideClicks);
      }
    }, false);

    // Build and add the modal to the body at the bottom
    document.body.appendChild(modal);
  };

  /**
   * @description This display function is used exclusively by the builder
   * <code>inaccessible.buildTable</code> to add a new row to an extant table as
   * required. Depending on the type of table needing updating via the addition
   * of a new row, the contents thereof may differ and require specific handling
   * to ensure all required data is displayed properly and logically in
   * accordance with user expectations. For instance, for the documents overview
   * table, the cells in the second column related to document name must be
   * clickable links permitting the user to see the general ledger entries
   * associated with that document. However, this behavior should not appear in
   * any other table, requiring special handling to ensure all tables appear
   * properly. A series of <code>switch</code> and <code>case</code> blocks
   * and <code>if</code> statement blocks serve to accomplish this.
   *
   * @param {object} paramRowObject Object of element row cell data
   * @param {HTMLElement} paramTable HTML table element
   * @param {object} paramTableConfig Config obj related to the specific table
   * @returns {void}
   */
  inaccessible.displayTableRow = function (paramRowObject, paramTable,
      paramTableConfig) {

    // Declarations
    let that, tbody, rowCount, columnCount, newRow, newCell, valuesArray,
      newButton, configCheckbox, configButton;

    // Preserve scope
    that = this;

    // For storage of values associated with object property keys
    valuesArray = [];

    // Table body
    tbody = paramTable.getElementsByTagName('tbody')[0];

    // Number of current rows in tbody, figure out where to put the new one
    rowCount = tbody.rows.length;

    // Number of header columns
    columnCount = paramTable.rows[0].cells.length;

    // Insert a new row
    newRow = tbody.insertRow(rowCount);

    // Add new value to array
    for (let key in paramRowObject) {
      valuesArray.push(paramRowObject[key]);
    }

    // Individual config for this checkbox
    configCheckbox = {
      type: 'checkbox',
      class: Identifiers.CLASS_DASHBOARD_LEDGER_TABLE_CHECKBOX,
    };

    // Config object for optional cell button elements
    configButton = {
      class: Identifiers.CLASS_GENERAL_LINK_BUTTON,
    };

    for (let i = 0; i < columnCount; i++) {

      // Create new cell
      newCell = newRow.insertCell(i);
      newCell.setAttribute('class', paramTableConfig.name);

      /**
       * This <code>switch</code> statement is used to determine what element to
       * build in the table depending on the column in which the cell is to
       * appear. The first cell in the row is reserved for deletion checkboxes,
       * used to allow the user to delete entries at will. The second cell may
       * be a link button used to navigate to a clicked document's individual
       * ledger entries, but this is optional and may be switched off (get it?
       * switched off in a <code>switch</code> block? heh) via the boolean
       * <code>useTextNodesOnly</code>. If it is set to text ndoes only, the
       * statement does not break but instead falls through into the
       * <code>default</code> case and just creates a text node cell.
       */
      switch (i) {
        case 0: // Deletion checkbox
          newCell.appendChild(this.assembleElement(['input', configCheckbox]));
          break;
        case 1:
          if (!paramTableConfig.useTextNodesOnly) {

            // Create a new link button element
            newButton = this.assembleElement(['button', configButton,
              valuesArray[i - 1]]);

            // Event listener -> load document's individual ledger entries
            newButton.addEventListener('click', function () {
              that.handleTableDataLoading('generalLedgerRows',
                valuesArray[i - 1]);
            }, false);

            newCell.appendChild(newButton);
            break;
          }
        default:
          newCell.appendChild(document.createTextNode(
            (valuesArray[i - 1] == null)
              ? Text.DIV_GENERAL_DASH
              : valuesArray[i - 1]
          ));
          break;
      }
    }
  };

  /**
   * @description This builder function is used to construct a new <div> element
   * indicating to the user that the undertaken operation has succeeded or
   * failed, be that operation a modal-based information submission or a login
   * or account creation operation. The placement of the notice will depend on
   * the scene presently existing on the page, indicated via the enum value
   * of <code>inaccessible.scene</code>. If the boolean parameter named
   * <code>paramIsSuccess</code> is true, the CSS class that adds green text
   * will be added, whereas the class with a red text property will be applied
   * otherwise to indicate visually to the user the status of the operation.
   * <br />
   * <br />
   * The inspiration for this function and its appearance in the interface was
   * derived from the UMUC login screen's status notices on malformed login info
   * or some other error. In such cases, a little message in red text appears
   * below the textfields to alert the user that their credentials were refused.
   * These status notices were built similarly to serve the same purposes.
   * Additional inspiration came from a similar set of methods the author
   * created in his previous Java programs that displayed a type of
   * <code>JOptionPane</code> depending on a boolean parameter and a message.
   *
   * @param {boolean} paramIsSuccess Whether or not to attach success class
   * @param {string} paramMessage Message to display in the notice
   * @returns {void}
   */
  inaccessible.displayStatusNotice = function (paramIsSuccess, paramMessage) {

    // Declarations
    let configStatusDiv, location, status, statusDiv, extantNotice;

    // Choose class name fragment based on success of action
    status = (paramIsSuccess) ? 'SUCCESS' : 'FAILURE';

    // Config for the notice itself
    configStatusDiv = {
      id: Identifiers.ID_GENERAL_STATUS_DIV,
      class: Identifiers.CLASS_GENERAL_OPENSANS + ' ' +
        Identifiers[`CLASS_GENERAL_STATUS_${status}`]
    };

    // Duild the <biv> (too good of a typo to correct)
    statusDiv = this.assembleElement(['div', configStatusDiv, paramMessage]);

    // Determine whether or not there is already a status message in the modal
    extantNotice = document.getElementById(Identifiers.ID_GENERAL_STATUS_DIV);

    // Remove it if it does exist
    if (extantNotice) {
      extantNotice.remove();
    }

    // Switch placement location based on current scene
    switch (this.scene) {
      case 0: // MODAL
        location = Identifiers.ID_MODAL_SECTION;
        break;
      case 1: // LOGIN
        location = Identifiers.ID_LOGIN_BODY_INPUT_HOLDER;
        break;
      case 2: // DASHBOARD
      default:
        return;
    }

    // Add the bottom of body and above buttons
    this.append(location, statusDiv);
  };

  /**
   * @description This display function is used specifically by
   * <code>inaccessible.buildDocumentAdditionTableRow</code> to construct and
   * add a set of dropdown menu options related to the user's accounts. It
   * simply calls <code>inaccessible.assembleDropdownElement</code> for as many
   * times as there are user accounts and appends the option to the container.
   * It is not unlike <code>inaccessible.displayTypesDropdownElements</code> in
   * that respect, as it serves the same sort of dropdown population purposes,
   * though this more focused version handles arrays rather than objects.
   *
   * @param {HTMLElement} paramContainer The target dropdown menu element itself
   * @returns {void}
   */
  inaccessible.displayAccountDropdownElements = function (paramContainer) {

    // Declarations
    let that, dropdownOption;

    // Preserve scope
    that = this;

    // Add a new account dropdown for each of the user's accounts
    this.userAccounts.forEach(function (account) {

      // 1000-Cash
      dropdownOption = that.assembleDropdownElement({
        name: `${account.code}-${account.name}`,
        value: account.code,
      });

      // Add to dropdown menu
      paramContainer.appendChild(dropdownOption);
    });
  };

  /**
   * @description This display function is a glorified utility/helper function
   * that exists simply to reduce copy/pasta present in several of the builder
   * functions that require the dynamic assembly of dropdown options using the
   * properties of the <code>Types</code> enum. This function builds a new
   * dropdown option using entries present in one of the two <code>Types</code>
   * arrays (<code>DOCUMENT</code> or <code>ACCOUNT</code>) before adding that
   * new element to the argument parameter dropdown menu.
   *
   * @param {string} paramType String denoting the <code>Types</code> array
   * @param {HTMLElement} paramMenu Dropdown menu to which entries are added
   * @returns {void}
   */
  inaccessible.displayTypesDropdownElements = function (paramType, paramMenu) {

    // Declaration
    let typeArray;

    // Can alias enum property in this definition
    typeArray = Types[paramType];

    // Add new dropdown option to parameter menu
    for (let type in typeArray) {
      paramMenu.appendChild(this.assembleDropdownElement({
        name: typeArray[type],
        value: type,
      }));
    }
  };

  // Handler functions

  /**
   * @description This function is the handler related to the creation of a new
   * user account. Under its current construction, it validates the new username
   * and password, ensuring that only alphanumeric characters are permitted in
   * either entry. Once validated, the data is passed to the relevant endpoint,
   * namely <code>create_user</code>, and the result of the creation operation
   * is displayed as a status notice in the module below the input fields.
   * <br />
   * <br />
   * This handler follows the same basic progression as all the other related
   * functions specifically used to handle the validation and submission of user
   * input to the back-end database. This handler checks that input is
   * wellformed and alphanumeric before checking that the inputted new passwords
   * actually match in terms of characters used. If an issue is encountered, the
   * handler throws an error and displays the resultant status notice in the
   * module as expected.
   *
   * @returns {void}
   */
  inaccessible.handleAccountCreation = function () {

    // Declarations
    let that, username, password, passwordReenter, data;

    // Preserve scope
    that = this;

    // Get user input field values
    username=
      document.getElementById(Identifiers.ID_LOGIN_BODY_INPUT_USERNAME).value;
    password =
      document.getElementById(Identifiers.ID_LOGIN_BODY_INPUT_PASSWORD).value;
    passwordReenter =
      document.getElementById(Identifiers.ID_LOGIN_BODY_INPUT_REENTER).value;

    // Alphanumeric data only for username and password
    if (!this.isLegalInput(username) || !this.isLegalInput(password) ||
        !this.isLegalInput(passwordReenter)) {

      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    // Passwords must match
    if (password !== passwordReenter) {
      this.displayStatusNotice(false, Text.ERROR_MISMATCHING_PASSWORDS);
      return;
    }

    // Send POST request with no encoding
    this.sendRequest('POST', 'php/create_user.php', {
      encode: false,
      params: {
        username: username,
        password: password,
      },
    }).then(function (response) {

      // Parse the JSON response into a usable object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // Notices for successful creations, duplicate accounts, or other errors
      if (data.success) {
        that.displayStatusNotice(true, Text.SUCCESS_ACCOUNT_CREATED);
      } else {
        if (data.duplicate) {
          that.displayStatusNotice(false, Text.ERROR_ACCOUNT_EXISTS);
        } else {
          that.displayStatusNotice(false, Text.ERROR_OTHERERROR);
        }
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description This handler is for presses of the "Create account" and "Back"
   * buttons in the login module. The handler works by accepting a builder
   * function name and an array of strings representing the names of
   * <code>ModuleButtons</code> to include in the module footer. Using these, a
   * new body content framework is constructed, disguised by way of fade-ins and
   * fade-outs which replace the body of the login module with either the
   * account creation or login mini-module scenes.
   * <br />
   * <br />
   * It was this particular function and associated process, the move between
   * the login and account creation modules, that brought about the eventual
   * refactor of <code>inaccessible.tinderize</code> that allows for partial
   * fading in on a specific in-scene element without having to remove the
   * entire scene and rebuild most of its contents with some adjustments. The
   * author had originally planned to have separate scenes for the account
   * creation and login modules, but discovered that very few differences
   * existed between them, leading him to develop a means of swapping out only
   * certain parts of the scene without having to recreate the entire thing each
   * time just to alter a few elements.
   *
   * @param {string} paramBuilder Name of the builder function to invoke
   * @param {!Array<string>} paramButtons Array of <code>ModuleButtons</code>
   * @returns {void}
   */
  inaccessible.handleLoginSceneChanges = function (paramBuilder, paramButtons) {

    // Declarations
    let buttonsArray, builderConfig;

    // Definition
    buttonsArray = [];

    // Add ModuleButtons instance to the buttons array
    paramButtons.forEach(function (buttonString) {
      buttonsArray.push(ModuleButtons[buttonString]);
    });

    // Tinderize's builder function config
    builderConfig = {
      name: paramBuilder,
      args: [buttonsArray],
    };

    // Do not swipe right, fade in/out on main module body element
    this.tinderize(false, Identifiers.ID_LOGIN_CONTENT, builderConfig, true);
  };

  /**
   * @description This handler function is invoked once the user has pressed the
   * "Login" button in the login modal scene. It grabs the values inputted by
   * the user in the username and password input textboxes and calls
   * <code>inaccessible.isLegalInput</code> for each <code>String</code> to
   * ensure that input is alphanumeric in nature. If it is wellformed input, the
   * handler <code>inaccessible.tinderize</code> is called to shift the scene to
   * the right while fading out before clearing the DOM and building the next
   * scene. It is built more or less according to the same basic template as the
   * other input handlers like <code>inaccessible.handleAccountCreation</code>,
   * calling the various utility functions to validate input so as to not
   * accidentally pass incorrect input off to the appropriate endpoints.
   *
   * @returns {void}
   */
  inaccessible.handleLogin = function () {

    // Declarations
    let that, username, password, data, builderConfig;

    // Preserve scope context
    that = this;

    // Get user input field values
    username =
      document.getElementById(Identifiers.ID_LOGIN_BODY_INPUT_USERNAME).value;
    password =
      document.getElementById(Identifiers.ID_LOGIN_BODY_INPUT_PASSWORD).value;

    // Alphanumeric data only for username and password
    if (!this.isLegalInput(username) || !this.isLegalInput(password)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    // Tinderize config for builder function
    builderConfig = {
      name: 'buildUserInterface',
    };

    // No need for a POST request in test mode
    if (TESTING) {
      this.tinderize(true, Identifiers.ID_LOGIN_CONTAINER, builderConfig,
        false);
      return;
    }

    // Send request without encoding; use query strings
    this.sendRequest('POST', 'php/login.php', {
      encode: false,
      params: {
        username: username,
        password: password,
      },
    }).then(function (response) {

      // Parse JSON into object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // If successful, build the dashboard, otherwise display error message
      if (data.isLogonSuccessful) {
        that.tinderize(true, Identifiers.ID_LOGIN_CONTAINER, builderConfig,
          false);
      } else {
        that.displayStatusNotice(false, Text.ERROR_LOGIN_FAILED);
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description Handler for presses of the "Logout" button option in the
   * upper-right toolbar. This function simply calls the scene shifting function
   * <code>inaccessible.tinderize</code> to return to the login modal. Assuming
   * the user is not running the bookkeeping application in test mode via the
   * <code>TESTING</code> constant set to a boolean value of <code>true</code>,
   * the user's logged-in PHP session is killed by the appropriate API endpoint,
   * ensuring that the user is properly logged out and that his/her personal
   * data is inaccessible to any other users of the application or the browser
   * window.
   *
   * @returns {void}
   */
  inaccessible.handleLogout = function () {

    // Declaration
    let builderConfig;

    // Tinderize builder config object
    builderConfig = {
      name: 'buildLoginModule',
      args: [
        this.buildLoginContent(
          [ModuleButtons.CREATE_ACCOUNT, ModuleButtons.LOGIN]
        )
      ],
    }

    // Kill session if not in test mode
    if (!TESTING) {
      this.sendRequest('POST', 'php/logout.php');
    }

    // Fade out and create login interface again
    this.tinderize(true, Identifiers.ID_DASHBOARD_CONTAINER, builderConfig,
      true);
  };

  /**
   * @description As the name implies, this handler is used to close the modal
   * window on the press of the appropriate in-modal button. It basically just
   * removes the entire window from the view model without any transitions or
   * anything. In most cases, this function is invoked upon presses of the modal
   * "Close" button that appears in all modal windows by default; however, the
   * function also sees use whenever the user clicks outside of the modal window
   * on the blackout element. This behavior is construed by the application as
   * the user wanting to exit the modal and return to the dashboard tables, and
   * the event listener in question calls this function before deleting itself
   * from the document event listeners listing as a result.
   *
   * @returns {void}
   */
  inaccessible.handleModalClose = function () {

    // Declaration
    let modal;

    // Grab element
    modal = document.getElementById(Identifiers.ID_MODAL_BLACKOUT);

    // Remove modal from the DOM
    modal.parentNode.removeChild(modal);

    // Reset scene flag to dashboard
    this.scene = Scenes.DASHBOARD;
  };

  /**
   * @description This function is used to clear the input textboxes present on
   * certain modal bodies (the mini-scenes) on the press of the "Clear" button.
   * It works by collecting in an <code>HTMLCollection</code> all the textbox
   * elements of a certain class that are contained in the body of the modal.
   * In the early days of the modal design, this handler's button was added by
   * default along with the "Submit" button if the invoking function passed as
   * a parameter a string representing a submission handler to be used to
   * validate user input. However, the button and this associated handler were
   * made optional eventually, as in some cases the user might not need the
   * option to clear all input fields in every case.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormClear = function () {

    // Declaration
    let textboxes, statusNotice;

    // Grab the input textboxes in the main modal section body (HTMLCollection)
    textboxes = document
      .getElementById(Identifiers.ID_MODAL_SECTION)
      .getElementsByClassName(Identifiers.CLASS_MODAL_SECTION_TEXTBOX);

    // Grab any extant success/failure action notice
    statusNotice = document.getElementById(Identifiers.ID_GENERAL_STATUS_DIV);

    // Remove any status notices if present
    if (statusNotice) {
      statusNotice.remove();
    }

    // Set each input value as an empty string
    for (let textbox of textboxes) {
      textbox.value = '';
    }
  };

  /**
   * @description This noop'd handler is the formlesss function used to handle
   * submission of user data on the press of the "Submit" button. This is the
   * default handler present in the <code>ModalButtons</code> enum and will
   * always be overridden by any implementing functions that shallow copy the
   * appropriate button config object and adjust the <code>functionName</code>
   * handler string. Originally, the author had intended for this function to
   * do some default submission handling, but given the vast differences in
   * input validation and passage parameters required for the transmission of
   * data to certain endpoints, this function soon proved useless. Along with
   * the related legacy code in <code>inaccessible.displayModal</code>, this
   * function is only kept around for archiving purposes.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormSubmit = function () {};

  /**
   * @description This function handler is used to add a new pseudo-table row to
   * the document addition modal's <code>form</code> pseudo-table. It is a
   * glorified utility function in that respect, notable only for being one of
   * the few functions to make use of the jQuery-esque utility function
   * <code>inaccessible.append</code>, which was one of the first functions
   * added by the author to this JS file. It basically just creates a new row
   * via <code>inaccessible.buildDocumentAdditionTableRow</code> and appends
   * that pseudo-row <code>div</code> to the <code>form</code> table.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormRowAddition = function () {

    // Declaration
    let pseudoTableRow;

    // Build new table row
    pseudoTableRow = this.buildDocumentAdditionTableRow();

    // Add new pseudo-row to pseudo-table in modal
    this.append(Identifiers.ID_DOCUMENT_TABLE, pseudoTableRow);
  };

  /**
   * @description This handler is simply responsible for printing the contents
   * of the currently viewed ledger on presses of the "Print ledger" topbar
   * navlink. Originally, the author had planned on focusing this function a bit
   * to have it target only a certain section of the page to print (namely, the
   * dashboard table section in one of its varied forms), but the alacrity at
   * which the CSS engineering team got to work developing the associated CSS
   * styling negated the need for this specificity, as they made use of
   * <code>display:none;</code> to remove the elements they did not need to have
   * appear in the print view.
   *
   * @returns {void}
   */
  inaccessible.handlePagePrinting = function () {
    window.print();
  };

  /**
   * @description This handler is called by <code>inaccessible.tinderize</code>
   * after the completion of the builder assembly and addition operations to
   * complete any remaining post-load operations necessary to the proper display
   * of the page content. Post-load adjustments are scene specific and are
   * optional, and are only called in certain context to make any last minute
   * adjustments before the user sees the scene on the page.
   * <br />
   * <br />
   * For the dashboard table scenes, this function is used to manually adjust
   * the width of each table cell depending on the number of headers present in
   * that table. For instance, the accounts table has a total of four headers,
   * thus, the width of each column would be the width of the table divided by
   * the number of headers. For the login module screen, the post-load
   * adjustment is simply a direction of focus onto the username input textfield
   * for ease of use by mobile viewers.
   *
   * @returns {void}
   */
  inaccessible.handlePostLoadAdjustments = function () {

    // Declarations
    let table, rows, index;

    switch (this.scene) {

      /**
       * <code>case</code> one relates to the need for mobile viewers to focus
       * on the username input textfield on the initialization of the login
       * module interface. The use of this case in particular allows for the
       * reduction of similar copy/pasted instances scattered throughout the
       * module.
       */
      case 1: // Login
        this.focusOnLoad(`#${Identifiers.ID_LOGIN_BODY_INPUT_USERNAME}`,
          Utility.ELEMENT_CHECK_INTERVAL);
        break;

      /**
       * <code>case</code> two relates to the need to dynamically adjust the
       * sizes of HTML table columns depending on the number of headers present
       * in each table. Additionally, to ensure that cells containing the
       * deletion checkbox do not take up an inordinate amount of space, the
       * cell width of this cell is set to a static value defined in the enum
       * <code>Utility</code>.
       */
      case 2: // Dashboard

        // Definitions
        table = document.getElementById(Identifiers.ID_DASHBOARD_WRAPPER);
        rows = table.rows;

        for (let row of rows) {
          index = 0;
          for (let cell of row.cells) {

            // Deletion cell
            if (index++ === 0) {
              cell.style.width = `${Utility.DELETE_CHECKBOX_CELL_WIDTH}px`;

            // Other cells
            } else {
              cell.style.width =
                `${(table.offsetWidth - Utility.DELETE_CHECKBOX_CELL_WIDTH) /
                  (row.cells.length - 1)}px`;
            }
          }
        }
        break;

      // Modal has no post-load needs, so return otherwise
      default:
        return;
    }
  };

  /**
   * @description This handler function is used to create one of the five HTML
   * table types, either the document overview table, the customers table, the
   * vendors table, the accounts types, and the general ledger table with
   * entries related to each of the documents. The function makes use of an
   * internal object of objects containing config related to the various
   * elements required to handle the request and display of table data from the
   * back-end, ranging from an endpoint name and types of parameters required by
   * that endpoint to an array of headers in text form. The selected object as
   * denoted via the <code>paramTable</code string is then used to query the
   * right endpoint, build the right table, and construct all the table rows
   * using the back-end data.
   *
   * @param {string} paramTable String denoting the table type
   * @param {!string=} paramDoc Document whose ledger rows are requested
   * @returns {void}
   */
  inaccessible.handleTableDataLoading = function (paramTable, paramDoc = null) {

    // Declarations
    let that, requestDataOptions, selectedTable, data, builderConfig, tableData;

    // Preserve scope
    that = this;

    /**
     * Depending on the type of table required for construction, the config
     * option included here will be selected, providing an object with
     * properties related to the endpoint for each table type, the header text,
     * and various booleans indicating how the table rows are to be designed and
     * constructed.
     */
    requestDataOptions = {
      documents: {
        name: 'documents',
        request: 'GET',
        endpoint: 'get_documents',
        useTextNodesOnly: false,
        params: {},
      },
      generalLedgerRows: {
        name: 'generalLedgerRows',
        request: 'POST',
        endpoint: 'get_general_ledger_rows',
        useTextNodesOnly: true,
        params: {
          documentName: paramDoc,
        },
      },
      accounts: {
        name: 'accounts',
        request: 'GET',
        endpoint: 'get_accounts',
        useTextNodesOnly: true,
        params: {},
      },
      vendors: {
        name: 'vendors',
        request: 'GET',
        endpoint: 'get_vendors',
        useTextNodesOnly: true,
        params: {},
      },
      customers: {
        name: 'customers',
        request: 'GET',
        endpoint: 'get_customers',
        useTextNodesOnly: true,
        params: {},
      }
    };

    // Choose table type object from the object above
    selectedTable = requestDataOptions[paramTable];

    // Define scene flag
    this.scene = Scenes.DASHBOARD;

    // Get relevant info from proper endpoint
    this.sendRequest(
      selectedTable.request,
      (TESTING)
        ? `json/${selectedTable.endpoint}.json`
        : `php/${selectedTable.endpoint}.php`,
      {
        encode: false,
        params: selectedTable.params,
      },
    ).then(function (response) {

      // Parse JSON into object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // Test mode data is formatted a little differently for ledger entries
      tableData = (TESTING && paramDoc != null)
        ? data[paramTable][paramDoc]
        : data[paramTable];

      // Fade in on dashboard table element and build new table
      if (data.success) {
        if (tableData.length) {

          // Tinderize builder function config
          builderConfig = {
            name: 'buildTable',
            args: [
              selectedTable,
              tableData,
            ],
          };

          that.tinderize(false, Identifiers.ID_DASHBOARD_WRAPPER, builderConfig,
            true);
        } else {

          // Successful request, but no entries
          that.handleTableDisplayError(selectedTable.name,
            Text.DIV_TABLE_BUILD_MISSING_ENTRIES);
        }
      } else {

        // Unsuccessful request, possible empty table
        that.handleTableDisplayError(selectedTable.name,
          Text.DIV_TABLE_BUILD_ERROR);
      }
    }, function (error) {

      // Network error modal config
      builderConfig = {
        name: 'buildPlainModal',
        args: [Text.ERROR_NETWORK],
      };

      console.warn(error);
      that.displayModal(Text.DIV_TABLE_BUILD_FAILURE, builderConfig);
    });
  };

  /**
   * @description This handler is used exclusively by the above handler function
   * <code>inaccessible.handleTableDataLoading</code> to reduce some copy/pasta
   * present in cases wherein the user has attempted to have a table assembled
   * but run into an error possibly related to a table bereft of entries. In
   * such cases, the relevant <code>Text</code> enum property value is displayed
   * as a message indicating that the user may want to populate the table prior
   * to use. Since in the two cases wherein such message modal are shown both
   * make use of the <code>inaccessible.replaceAll</code> function to replace
   * template string fragments with the name of the relevant table, this handler
   * is invoked to reduce the need for duplicate code.
   *
   * @param {string} paramTable Name string of the selected table
   * @param {string} paramMessage <code>Text</code> property value message
   * @returns {void}
   */
  inaccessible.handleTableDisplayError = function (paramTable, paramMessage) {

    // Declaration
    let builderConfig;

    // Definition of builder config
    builderConfig = {
      name: 'buildPlainModal',
      args: [
        this.replaceAll(paramMessage, {
          '#1': paramTable,
          '#2': paramTable.slice(0, -1), // Remove 's'
        })
      ],
    };

    // Plain modal displaying status text
    this.displayModal(Text.DIV_TABLE_BUILD_FAILURE, builderConfig);
  };

  /**
   * @description This function is used to handle cases wherein the user elects
   * to change his/her password. In such cases, the user must enter the new
   * password twice and ensure they match before the POST request can be made to
   * the server. Assuming the passwords are alphanumeric in nature, any password
   * combinations are permitted for these fields.
   * <br />
   * <br />
   * The handler is a custom substitute for the default "Submit" button in the
   * modal interface, and is thus used specifically in the "Change password"
   * modal window. It is built to be similar to the other input submission
   * handlers like <code>inaccessible.handleAccountCreation</code> and
   * <code>inaccessible.handleLogin</code>, and was for a time one of several
   * handlers the author had considered consolidating together into a super
   * input validation handler. However, this idea was eventually nixed in case
   * significant changes needed to be made to one of these handlers and also to
   * ensure program progression could be more easily traced. In the author's
   * experience, consolidating functions, while performance-friendly, can
   * sometimes make things more confusing to read.
   *
   * @returns {void}
   */
  inaccessible.handlePasswordChange = function () {

    // Declarations
    let that, password, passwordReenter, data;

    // Preserve scope
    that = this;

    // Get user input field values
    password =
      document.getElementById(Identifiers.ID_CHANGEP_INPUT_PASSWORD).value;
    passwordReenter =
      document.getElementById(Identifiers.ID_CHANGEP_INPUT_REENTER).value;

    // Input fields must not be left blank
    if (this.isBlank(password) || this.isBlank(passwordReenter)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT_BLANK);
      return;
    }

    // Alphanumeric data only for passwords
    if (!this.isLegalInput(password) || !this.isLegalInput(passwordReenter)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    // Passwords must match
    if (password !== passwordReenter) {
      this.displayStatusNotice(false, Text.ERROR_MISMATCHING_PASSWORDS);
      return;
    }

    // Send POST request
    this.sendRequest('POST', 'php/set_password.php', {
      encode: false,
      params: {
        password: passwordReenter,
      },
    }).then(function (response) {

      // Parse the JSON response into a usable object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // Check server response data for successful password reset
      if (data.isPasswordSetSuccessful) {
        that.displayStatusNotice(true, Text.SUCCESS_PASSWORD_RESET);
      } else {
        that.displayStatusNotice(false, Text.ERROR_FAILED_PASSWORD_RESET);
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description This function is the handler for submission of user input data
   * related to new documents. It individually evaluates and validates all of
   * the fields for the document name, the type, the party involved in the
   * entry, and the input fields for each of the new ledger entries to be
   * included in the ledger. It does by making use of a number of utility
   * functions used to validate input and ensure that only proper wellformed
   * data is provided to the server by means of the <code>add_document</code>
   * endpoint.
   * <br />
   * <br />
   * Of all the back-end data input endpoints for POST requests, the document
   * addition endpoint <code>add_document</code> is certainly the most involved
   * and complex of the lot. Due to high level of specificity required to
   * properly pass input and add a new document and the pseudo-HTML table design
   * paradigm the author saw fit to employ, this function is very complex in
   * itself. In particular, in order to handle the pseudo-table row structure of
   * the modal table, this handler makes use of a pair of nested named
   * <code>for/of</code> loop constructs to iterate over the
   * <code>HTMLCollection</code>s of rows and cells, checking their contents and
   * adding them to the endpoint params object as required. Of all the handlers
   * in this section of the module, this is probably the most involved.
   *
   * @returns {void}
   */
  inaccessible.handleDocumentAddition = function () {

    // Declarations
    let that, data, input, entryRows, index, documentName, type, party,
      generalLedgerRows, ledgerRowObject, credebit, wasProblemDetected;

    // Preserve scope
    that = this;

    // Define the object to be passed as params to endpoint
    input = {};

    // Flag to halt function progression in case of error
    wasProblemDetected = false;

    // Grab values and rows HTMLCollection
    documentName =
      document.getElementById(Identifiers.ID_DOCUMENT_INPUT_NAME).value;
    type =
      document.getElementById(Identifiers.ID_DOCUMENT_DROPDOWN_TYPE).value;
    party =
      document.getElementById(Identifiers.ID_DOCUMENT_DROPDOWN_PARTY).value;
    entryRows = document
      .getElementById(Identifiers.ID_DOCUMENT_TABLE)
      .getElementsByClassName(Identifiers.CLASS_DOCUMENT_TABLE_ROW_WRAPPER);

    // Check document name. If proper, add to params object as documentName
    if (!this.isLegalInput(documentName)) {
      this.displayStatusNotice(false, Text.ERROR_DOCU_NAME_ANUMER);
      return;
    } else {
      input.documentName = documentName;
    }

    // Set doc type from default input value
    input.type = type;

    // Determine if selected party (if any) is customer or vendor
    if (['API', 'APD'].includes(type)) {
      input.vendorName = party;
    } else if (['ARI', 'ARR'].includes(type)) {
      input.customerName = party;
    }

    // New array for row objects
    input.generalLedgerRows = [];

    outerLoop: // Iterate over pseudo-rows in pseudo-table
    for (let row of entryRows) {

      // Reset index for each new row
      index = 0;

      // New row object
      ledgerRowObject = {};

      innerLoop: // Iterate over pseudo-row cells
      for (let child of row.children) {
        switch (index++) {
          case 0: // Deletion checkbox - we don't need that
            break;
          case 1: // Code input field
            if (that.isBlank(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_BLANK_INPUT);
              wasProblemDetected = true;
              break outerLoop;
            } else if (isNaN(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_CODE_NUMER);
              wasProblemDetected = true;
              break outerLoop;
            } else {
              ledgerRowObject.code = child.value;
            }
            break;
          case 2: // Date field
            if (that.isBlank(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_BLANK_INPUT);
              wasProblemDetected = true;
              break outerLoop;
            } else if (!that.isValidDate(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_DATE_FORMAT);
              wasProblemDetected = true;
              break outerLoop;
            } else {
              ledgerRowObject.date = child.value;
            }
            break;
          case 3: // Credit or debit dropdown
            credebit = child.value.toLowerCase();
            break;
          case 4: // Dollar amount
            if (that.isBlank(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_BLANK_INPUT);
              wasProblemDetected = true;
              break outerLoop;
            } else if (!that.isValidAmount(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_AMOUNT);
              wasProblemDetected = true;
              break outerLoop;
            } else {
              ledgerRowObject[credebit] = child.value;
            }
            break;
          case 5: // Description
            if (that.isBlank(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_BLANK_INPUT);
              wasProblemDetected = true;
              break outerLoop;
            } else if (!that.isLegalInput(child.value)) {
              that.displayStatusNotice(false, Text.ERROR_DOCU_DESC_ANUMER);
              wasProblemDetected = true;
              break outerLoop;
            } else {
              ledgerRowObject.description = child.value;
            }
            break;
          default:
            break;
        }
      }

      // Add new ledger row object to the array
      input.generalLedgerRows.push(ledgerRowObject);
    }

    // Only generalLedgerRows is encoded as JSON
    input.generalLedgerRows = JSON.stringify(input.generalLedgerRows);

    // If we break'd (lulz) from the outer loop, we don't want to proceed
    if (wasProblemDetected) {
      return;
    }

    if (DEBUG) {
      console.log(input);
    }

    // No need for POST request if in test mode
    if (TESTING) {
      this.displayStatusNotice(true, Text.SUCCESS_DOCU_CREATED);
      this.handleTableDataLoading('documents');
      return;
    }

    // This is the only POST request requiring JSON-encoded input passed
    this.sendRequest('POST', 'php/add_document.php', {
      encode: false,
      params: input,
    }).then(function (response) {

      // Parse the JSON response into a usable object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // Display success status notice and load updated doc overview table
      if (data.success) {
        that.displayStatusNotice(true, Text.SUCCESS_DOCU_CREATED);
        that.handleTableDataLoading('documents');
      } else {
        that.displayStatusNotice(false, Text.ERROR_OTHERERROR);
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description This function is the main handler associated with the first
   * dropdown of the "Add document" modal, the menu providing the user with a
   * listing of the five major document types. This handler is called by the
   * event listener invoked on change to the dropdown selected option and is
   * tasked with populating the second dropdown menu with extant customers or
   * vendors previously entered by the user at some point. Ideally, the author
   * should have probably done what he did for the user accounts; cache them in
   * an <code>inaccessible</code> scope object property so that only two such
   * GET requests max would be needed, one for vendors and one for customers.
   * <br />
   * <br />
   * For example, if the user had entered a vendor named "Baltimore Gas and
   * Electric" and decided to create a new accounts payable invoice document,
   * this handler would query the database via a GET request for a listing of
   * vendors, displaying BGE as a possible option for selection by the user in
   * the dropdown menu.
   *
   * @param {HTMLElement} paramMenu Dropdown menu in question
   * @returns {void}
   */
  inaccessible.handleDocumentDropdownChange = function (paramMenu) {

    // Declarations
    let that, selectedOption, endpoint, partyType, data, partyDropdown,
      extantNotice, extantParties, dropdownElementConfig;

    // Preserve scope
    that = this;

    // Determine whether or not there is already a status message in the modal
    extantNotice = document.getElementById(Identifiers.ID_GENERAL_STATUS_DIV);

    // Remove it if it does exist
    if (extantNotice) {
      extantNotice.remove();
    }

    // Selected value of the inputted parameter dropdown menu
    selectedOption = paramMenu.value;

    /**
     * This <code>switch</code> block is used to determine which endpoint to
     * query for parties (vendors or customers) to populate as party dropdown
     * menu option entries. API and APD documents are related to vendors, so
     * vendors are loaded in the dropdown. ARI and ARR documents are related to
     * customers and thus the dropdown is populated by customer entries. Journal
     * entries have no related parties.
     */
    switch (selectedOption) {
      case 'API': // Accounts payable invoice
      case 'APD': // Accounts payable disbursement
        partyType = 'vendors';
        break;
      case 'ARI': // Accounts receivable invoice
      case 'ARR': // Accounts receivable receipt
        partyType = 'customers';
        break;
      case 'JE':  // Journal entry
      default:
        partyType = null;
        break;
    }

    // Journal entry selected (party optional)
    if (partyType == null) {
      return;
    }

    // Dropdown menu for display of extant customers or vendors
    partyDropdown =
      document.getElementById(Identifiers.ID_DOCUMENT_DROPDOWN_PARTY);

    // Remove all but the first default option
    partyDropdown.options.length = 1;

    // Either get_vendors or get_customers
    this.sendRequest(
      'GET',
      (TESTING)
        ? `json/get_${partyType}.json`
        : `php/get_${partyType}.php`
    ).then(function (response) {

      // Parse JSON for use in loop
      data = JSON.parse(response);

       // Array of customers or vendors
      extantParties = data[partyType];

      if (DEBUG) {
        console.log(data);
      }

      // Add entries if sucessful
      if (data.success) {

        // Doesn't matter if successful if there are no entries
        if (extantParties.length > 0) {

          // This approach will need some refactoring in future
          extantParties.forEach(function (party) {

            // Build new element config
            dropdownElementConfig = {
              name: party.name,
              value: party.name, // originally encoded
            };

            // Add the customer/vendor dropdown option to menu
            partyDropdown.appendChild(
              that.assembleDropdownElement(dropdownElementConfig));
          });
        } else {
          that.displayStatusNotice(false, // "Could not display vendors"
            Text.ERROR_DOCU_PARTY_DISPLAY.replace('$1', partyType));
        }
      } else {
        that.displayStatusNotice(false, // "Could not display vendors"
          Text.ERROR_DOCU_PARTY_DISPLAY.replace('$1', partyType));
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description This handler is responsible for handling the passage of user
   * input data to the server in the event of a user's attempted input of data
   * pertaining to a new customer or vendor entry. In such cases, the name and
   * address are extracted from the textfields and the specific endpoint to
   * query is determined by the text of the modal title. The modal title name is
   * itself determined by the button pressed. This system, while complex and
   * involved, removes the need for a second duplicate copy/pasta handler, which
   * was originally the case prior to the customer and vendor input handlers
   * being consolidated into this single handler. Unlike the author's plan to
   * consolidate a number of the input handlers together into a super handler,
   * these two handlers were the most alike. Thus, the combination thereof was
   * not overly difficult to undertake, preserving readability while still
   * allowing for copy/pasta reduction.
   *
   * @returns {void}
   */
  inaccessible.handleCustomerOrVendorAddition = function () {

    // Declarations
    let that, name, address, headerText, partyType, endpoint, data;

    // Preserve scope
    that = this;

    // Grab values from input elements
    name =
      document.getElementById(Identifiers.ID_CORV_INPUT_NAME).value;
    address =
      document.getElementById(Identifiers.ID_CORV_INPUT_ADDRESS).value;
    headerText =
      document.getElementById(Identifiers.ID_MODAL_HEADER_TITLE).textContent;

    // Either 'customer' or 'vendor'
    partyType = headerText.split(' ')[1];

    // 'Add customer' -> 'add_customer'
    endpoint = this.encode(headerText);

    // Input fields must not be left blank
    if (this.isBlank(name) || this.isBlank(address)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT_BLANK);
      return;
    }

    // Alphanumeric data only for username and password
    if (!this.isLegalInput(name) || !this.isLegalInput(address)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    // No need for a POST request if in test code
    if (TESTING) {
      this.displayStatusNotice(true, Text.SUCCESS_CORV_SUBMIT);
      this.handleTableDataLoading(`${partyType}s`);
      return;
    }

    this.sendRequest('POST', `php/${endpoint}.php`, {
      encode: false,
      params: {
        name: name,
        address: address,
      },
    }).then(function (response) {

      // Parse JSON into object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // If successful, no need to examine response further
      if (data.success) {
        that.displayStatusNotice(true, Text.SUCCESS_CORV_SUBMIT);
        that.handleTableDataLoading(`${partyType}s`);
      } else {

        // Entry already exists, let the user know via status notice
        if (data.duplicate) {
          that.displayStatusNotice(false, Text.ERROR_CORV_DUPLICATE);
        } else {
          that.displayStatusNotice(false, Text.ERROR_OTHERERROR);
        }
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description Like the rest of the modal handlers, this handler is used to
   * collect and collate user input. In particular, it handles attempts by the
   * user to pass new account data off to the back-end, ensuring that account
   * code is numeric and name input is alphanumeric before passing code, name,
   * and type off to the <code>add_account</code> PHP endpoint. Like all the
   * other input handlers included in this section of the module, this function
   * shares some design similarities with the other handlers such as
   * <code>inaccessible.handleAccountCreation</code>, <code>handleLogin</code>,
   * and <code>inaccessible.handlePasswordChange</code>, and was one of those
   * the author considered consolidating into a single master input handler, an
   * idea that was eventually abandoned as discussed above.
   *
   * @returns {void}
   */
  inaccessible.handleAccountAddition = function () {

    // Declarations
    let that, code, name, type, data;

    // Preserve scope
    that = this;

    // Grab input field values
    code = document.getElementById(Identifiers.ID_ADDACC_INPUT_CODE).value;
    name = document.getElementById(Identifiers.ID_ADDACC_INPUT_NAME).value;
    type = document.getElementById(Identifiers.ID_ADDACC_DROPDOWN_TYPE).value;

    // Code must be numeric (i.e. 1000)
    if (isNaN(code)) {
      this.displayStatusNotice(false, Text.ERROR_DOCU_CODE_NUMER);
      return;
    }

    // Input field must not be left blank
    if (this.isBlank(name)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT_BLANK);
      return;
    }

    // Alphanumeric data only for name
    if (!this.isLegalInput(name)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    // Send POST request using query strings REST approach
    this.sendRequest('POST', 'php/add_account.php', {
      encode: false,
      params: {
        code: code,
        name: name,
        type: type,
      },
    }).then(function (response) {

      // Parse JSON into object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // If successful, no need to examine response further
      if (data.success) {
        that.displayStatusNotice(true, Text.SUCCESS_ADDACC_SUBMIT);
        that.handleTableDataLoading('accounts');
      } else {

        // Entry already exists, let the user know via status notice
        if (data.accountAlreadyExists) {
          that.displayStatusNotice(false, Text.ERROR_ADDACC_DUPLICATE);
        } else {
          that.displayStatusNotice(false, Text.ERROR_OTHERERROR);
        }
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description This handler deals with presses of the "Add default accounts"
   * sidebar button, used to automatically create some default accounts for the
   * user. Depending on whether or not the user has already created a set of
   * default accounts before, the handler will build and display a different
   * status modal informing the user of the success of the operation, showing
   * either an unordered list of newly created default accounts or a simple
   * text-based modal indicating that the accounts have already been created
   * prior to the button press.
   * <br />
   * <br />
   * As discussed in some detail in this handler's related builder function
   * <code>inaccessible.buildDefaultAccountsModal</code>, the means by which
   * this functionality was to be displayed was somewhat difficult for the
   * author, given that the modal framework was never designed to simply provide
   * status notices in popup form to the user. However, given a lack of better
   * options, the user just went with it, displaying a list of new accounts if
   * successful and a simple text response if not. There are certainly better
   * ways of undertaking this task, but the team was pressed for time by the
   * time this functionality went live on the back-end.
   *
   * @returns {void}
   */
  inaccessible.handleDefaultAccountsAddition = function () {

    // Declarations
    let that, data, builderConfig;

    // Preserve scope
    that = this;

    // Get the created accounts
    this.sendRequest(
      'GET',
      (TESTING)
        ? 'json/defaultAccounts.json'
        : 'php/create_default_accounts.php'
    ).then(function (response) {

      // Parse JSON into object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // Tinderize config object
      builderConfig = {
        name: 'buildDefaultAccountsModal',
      };

      // Test mode as no data.success property, so we just pass the whole JSON
      if (TESTING) {
        builderConfig.args = [data];
        that.displayModal(Text.DIV_GENERAL_DEFAULT_ACCOUNTS, builderConfig);
        that.handleTableDataLoading('accounts');
        return;
      }

      // If successful, we display status modal & load table in the background
      if (data.success) {
        builderConfig.args = [data.accountsAdded];
        that.displayModal(Text.DIV_GENERAL_DEFAULT_ACCOUNTS, builderConfig);
        that.handleTableDataLoading('accounts');
      } else {

        // Otherwise, a failure status modal with simple text is shown
        if (data.userLoggedIn) {
          that.displayModal(Text.DIV_GENERAL_DEFAULT_ACCOUNTS, builderConfig);
        }
      }
    }, function (error) {

      // Network error modal config
      builderConfig = {
        name: 'buildPlainModal',
        args: [Text.ERROR_NETWORK],
      };

      console.warn(error);
      that.displayModal(Text.DIV_TABLE_BUILD_FAILURE, builderConfig);
    });
  };

  /**
   * @description This function handles the removal of ledger table entry rows
   * that have been marked for deletion via the associated checkbox elements
   * constituting the first cell of each row. Pressing the appropriate sidebar
   * button automatically removes these highlighted entries from the table. On
   * the back-end, this is mirrored through the concurrent <code>POST<code>
   * request indicating what element has been removed by the user. This was one
   * of the last pieces of functionality to be added to the program codebase,
   * despite the fact that the deletion checkboxes have existed as part of the
   * dashboard tables since the start of the front-end development period.
   * <br />
   * <br />
   * This handler works both for conventional HTML tables as they appear in the
   * dashboard scene and for the <code>form</code>-based pseudo-tables that
   * exist in the document addition modal. In both cases, on the selection of
   * the desired rows and press of the deletion button in its varied forms, the
   * row is removed from view.
   *
   * @returns {void}
   */
  inaccessible.handleRowRemoval = function () {

    // Declarations
    let checkedInputs, table, tableBody;

    // Implementation differs depending on the scene in question
    switch (this.scene) {
      case 2: // DASHBOARD
        table = document.getElementById(Identifiers.ID_DASHBOARD_WRAPPER);
        tableBody = table.querySelector("tbody");
        break;
      case 0: // MODAL
        table = document.getElementById(Identifiers.ID_DOCUMENT_TABLE);
        tableBody = table;
        break;
      case 1: // LOGIN
      default:
        return;
    }

    // Grab all checked checkboxes
    checkedInputs = document.querySelectorAll("input[type='checkbox']:checked");

    // For each checked box, we remove the entire row from the table's tbody
    Array.prototype.slice.call(checkedInputs).forEach(input =>
      tableBody.removeChild(
        (this.scene === Scenes.DASHBOARD)
          ? input.parentNode.parentNode
          : input.parentNode
      )
    );
  };

  // Main function

  /**
   * @description This function serves as the main initialization function,
   * called on the completion of the DOM load by the externally-facing function
   * <code>accessible.init</code>. It basically just creates the main container
   * element, adds it to the body, and begins the fade-in to the initial login
   * module scene. In some respects, it can be thought of as a stripped down
   * version of <code>inaccessible.tinderize</code>. Originally, the author had
   * planned for <code>main</code> to have more of an active role in the program
   * progression, but given the spaghetti code-nature of asynchronous JavaScript
   * and XML (AJAX), program progression wound through multiple layers of API
   * request callbacks and the like.
   *
   * @returns {void}
   */
  inaccessible.main = function () {

    // Declarations
    let loginScreen;

    // Apply body identifier
    document.body.setAttribute('id', Identifiers.ID_GENERAL_BODY);

    // Assemble the user interface dynamically
    loginScreen = this.buildLoginModule(this.buildLoginContent(
      [ModuleButtons.CREATE_ACCOUNT, ModuleButtons.LOGIN]));

    // Populate DOM body with assembled interface
    document.body.appendChild(loginScreen);

    // Fade in on the scene
    this.fade('in', Identifiers.ID_LOGIN_CONTAINER);

    // Focus event on username textfield
    this.focusOnLoad(`#${Identifiers.ID_LOGIN_BODY_INPUT_USERNAME}`,
      Utility.ELEMENT_CHECK_INTERVAL);
  };

  // Public functions

  /**
   * @description External getter for immutable <code>Utility</code>
   *
   * @returns {enum} Utility
   */
  accessible.getUtility = function () {
    return inaccessible.extend({}, Utility);
  };

  /**
   * @description External getter for immutable <code>Scenes</code>
   *
   * @returns {enum} Utility
   */
  accessible.getScenes = function () {
    return inaccessible.extend({}, Scenes);
  };

  /**
   * @description External getter for immutable <code>Identifiers</code>
   *
   * @returns {enum} Identifiers
   */
  accessible.getIdentifiers = function () {
    return inaccessible.extend({}, Identifiers);
  };

  /**
   * @description External getter for immutable <code>Text</code>
   *
   * @returns {enum} Text
   */
  accessible.getText = function () {
    return inaccessible.extend({}, Text);
  };

  /**
   * @description External getter for immutable <code>Operations</code>
   *
   * @returns {enum} Operations
   */
  accessible.getOperations = function () {
    return inaccessible.extend({}, Operations);
  };

  /**
   * @description External getter for immutable <code>ModalButtons</code>
   *
   * @returns {enum} ModalButtons
   */
  accessible.getModalButtons = function () {
    return inaccessible.extend({}, ModalButtons);
  };

  /**
   * @description External getter for immutable <code>ModuleButtons</code>
   *
   * @returns {enum} ModalButtons
   */
  accessible.getModuleButtons = function () {
    return inaccessible.extend({}, ModuleButtons);
  };

  /**
   * @description External getter for immutable <code>Types</code>
   *
   * @returns {enum} Types
   */
  accessible.getTypes = function () {
    return inaccessible.extend({}, Types);
  };

  /**
   * @description The central function of the <code>accessible</code> access
   * scope namespace, <code>init</code> is called on completion of the loading
   * of the HTML <code>body</code> element. This method is presently the only
   * externally accessible function or variable of the module, and simply calls
   * <code>inaccessible.main</code> to get the program started.
   *
   * @returns {void}
   */
  accessible.init = function () {
    inaccessible.main();
  };

  // Return globally-accessible object
  return accessible;
})();
