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
 * - Script-globals             Line xxxx
 * - Enums
 *   - Utility                  Line xxxx
 *   - Scenes                   Line xxxx
 *   - Identifiers              Line xxxx
 *   - Text                     Line xxxx
 *   - Operations               Line xxxx
 *   - ModalButtons             Line xxxx
 *   - ModuleButtons            Line xxxx
 *   - TableHeaders             Line xxxx
 *   - Types                    Line xxxx
 * - Data arrays
 *   - sidebarButtonData        Line xxxx
 *   - navlinksButtonData       Line xxxx
 * - Function groups
 *   - Utility functions        Line xxxx
 *   - Assembly functions       Line xxxx
 *   - Builder functions        Line xxxx
 *   - Display functions        Line xxxx
 *   - Handler functions        Line xxxx
 *   - Main function            Line xxxx
 *   - Public functions         Line xxxx
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
   * in the console. Though not a part of the <code>inaccessible</code> object,
   * it is still contained within the private restricted scope of the
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
   *
   * @const
   */
  const TESTING = true;

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
    FADE_IN_INTERVAL: 10,
    OPACITY_INCREASE_AMOUNT: 0.015,
    ELEMENT_CHECK_INTERVAL: 500,
    SWIPE_PIXEL_VALUE: 1,
    SWIPE_DISTANCE_VALUE: 250,
    SWIPE_INTERVAL_TIME: 2000,
    CHECK_OPACITY_RATE: 500,
    DELETE_CHECKBOX_CELL_WIDTH: 75,
  });

  /**
   * @description This enum is used to store integer values associated with the
   * different possible macro-scenes that can be loaded via user interaction.
   * These values are the possible values of <code>inaccessible.scene</code>, an
   * object property integer flag that indicates to certain functions what scene
   * is currently being displayed. In some cases, local variable values may
   * differ depending on the scene being displayed, allowing for the removal of
   * some scene-specific redundant code and permitting the use of one-size-fits-
   * all handlers in some cases.
   *
   * @readonly
   * @enum {integer}
   * @const
   */
  const Scenes = Object.freeze({
    MODAL: 0,       // Modal framework
    LOGIN: 1,       // Login module (Login + Create)
    DASHBOARD: 2,   // Dashboard (Docs + Ledger)
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
   * which will be doing the heavy lifting and will be supplied with the ids and
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
    ID_DASHBOARD_LEDGER_TABLE: 'dashboard-ledger-table',
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
    ID_ADDACC_CONTAINER: 'modal-addacc-container',
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
   * button or checkbox label elements.
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
    INPUT_DOCUMENT_CODE_PLACEHOLDER: 'Code',
    INPUT_DOCUMENT_DATE_PLACEHOLDER: 'Date',
    INPUT_DOCUMENT_AMOUNT_PLACEHOLDER: 'Amount',
    INPUT_DOCUMENT_DESCRIPTION_PLACEHOLDER: 'Description',
    INPUT_DOCUMENT_OPTION_CREDIT: 'Credit',
    INPUT_DOCUMENT_OPTION_DEBIT: 'Debit',
    INPUT_ADDACC_CODE_PLACEHOLDER:'Code',
    INPUT_ADDACC_NAME_PLACEHOLDER: 'Name',

    // Buttons
    BUTTON_LOGIN_FOOTER_CREATE: 'Create',
    BUTTON_LOGIN_FOOTER_SUBMIT: 'Login',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP: 'Change password',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_PRINT: 'Print ledger',
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
    DIV_GENERAL_TOGGLE: 'Toggle views',
    DIV_GENERAL_ADD: 'Add $1',
    DIV_GENERAL_TOGGLE_DOCS: 'View documents',
    DIV_GENERAL_TOGGLE_ACCOUNTS: 'View accounts',
    DIV_GENERAL_TOGGLE_CUSTOMERS: 'View customers',
    DIV_GENERAL_TOGGLE_VENDORS: 'View vendors',
    DIV_GENERAL_DELETE_ROW: 'Delete entry',
    DIV_GENERAL_DEFAULT_ACCOUNTS: 'Add default accounts',
    DIV_GENERAL_TOPBAR_TITLE: 'Keep Dem Books Y\'all', // Need some title
    DIV_GENERAL_TOPBAR_SUBTITLE: 'A bookkeeping application for CMSC 495',
    DIV_CHANGEP_INFORMATION: 'Please note that password entries must match',
    DIV_CORV_INFORMATION: 'Please input an entry name and address',
    DIV_DOCUMENT_INFORMATION: 'Please select document type & associated party',
    DIV_ADDACC_INFORMATION: 'Please input account numeric code and name',
    DIV_DEFAULT_SUMMARY: '"#2" (code #1) of type "#3"',
    DIV_DEFAULT_INFORMATION_SUCCESS: 'The following accounts have been added:',
    DIV_DEFAULT_INFORMATION_FAILURE: 'Default accounts already exist',

    // Error and success status text entries
    ERROR_NETWORK: 'A network error has been encountered',
    ERROR_ILLEGITIMATE_INPUT: 'Input content must be alphanumeric',
    ERROR_MISMATCHING_PASSWORDS: 'Passwords do not match',
    ERROR_FAILED_PASSWORD_RESET: 'Password reset unsuccessful',
    ERROR_LOGIN_FAILED: 'Login failed. Please check login details',
    ERROR_CORV_DUPLICATE: 'An entry with that name or address already exists',
    ERROR_CORV_OTHERERROR: 'An error was encountered. Please try again',
    ERROR_DOCU_PARTY_DISPLAY: 'Could not display extant $1',
    ERROR_DOCU_NAME_ANUMER: 'Document name must be alphanumeric',
    ERROR_DOCU_CODE_NUMER: 'Code must be numeric',
    ERROR_DOCU_DATE_FORMAT: 'Date must be formatted as YYYY-MM-DD',
    ERROR_DOCU_AMOUNT: 'Amount must be formatted as XXXX.XX',
    ERROR_DOCU_DESC_ANUMER: 'Description must be alphanumeric',
    ERROR_DOCU_BLANK_INPUT: 'Entry input fields cannot be blank',
    ERROR_DOCU_OTHERERROR: 'An error was encountered. Please try again',
    ERROR_ACCOUNT_EXISTS: 'An account with this name already exists',
    ERROR_ACCOUNT_OTHERERROR: 'An error was encountered. Please try again',
    ERROR_ADDACC_DUPLICATE: 'An account with these details already exists',
    ERROR_ADDACC_OTHERERROR: 'An error was encountered. Please try again',
    SUCCESS_ACCOUNT_CREATED: 'Account successfully created',
    SUCCESS_PASSWORD_RESET: 'Password successfully reset',
    SUCCESS_CORV_SUBMIT: 'New entry successfully added',
    SUCCESS_DOCU_CREATED: 'New document successfully created',
    SUCCESS_ADDACC_SUBMIT: 'New account successfully created',
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
   * configuration data used to build buttons via
   * <code>inaccessible.assembleButtonElement</code>. The various in-modal
   * mini-scene constructors are able to denote which default buttons to include
   * and can make shallow copies of some buttons in order to adjust click
   * handlers and the like as required for certain operations.
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
   * logging into extant accounts are included herein.
   *
   * @readonly
   * @enum {object}
   * @const
   */
  const ModuleButtons = Object.freeze({
    CREATE_ACCOUNT: { // Login scene
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
    NEW_ACCOUNT: { // Create account scene
      buttonType: Text.BUTTON_LOGIN_FOOTER_NEW,
      functionName: 'handleAccountCreation',
      functionArguments: [],
      requiresWrapper: false,
      elementId: Identifiers.ID_LOGIN_FOOTER_BUTTONS_NEW,
      elementClasses: [
        Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    },
    BACK: { // Create account scene
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
   * @description This enum of string arrays is used to store the names of the
   * two tables' headers. These headers are related to the general ledger (used
   * to display all the individual transactions that make up a document) and the
   * document overview table showing the currently posted documents.
   *
   * @readonly
   * @enum {!Array<string>}
   * @const
   */
  const TableHeaders = Object.freeze({
    ACCOUNTS: [
      'delete',          // Checkbox for deletion
      'code',            // Int code number
      'name',            // Account name
      'type',            // Account type
    ],
    DOCUMENTS: [
      'delete',          // Checkbox for deletion
      'name',            // Document name
      'type',            // Type of document
      'vendor/customer', // If applicable
    ],
    LEDGER: [
      'delete',          // Checkbox for deletion
      'number',          // Account number
      'account',         // Account name
      'debit',           // Debit
      'credit',          // Credit
      'memo',            // Description of transaction
      'name',            // Individual in question
      'date',            // Recorded date
    ],
    PARTIES: [
      'delete',          // Checkbox for deletion
      'name',            // Vendor/customer name
      'address',         // Vendor/customer address
    ],
  });

  /**
   * @description This enum is used to store several arrays of configuration
   * objects used to construct new dropdown menu options related to the types of
   * document and account available for creation by the user. They are iterated
   * over by a <code>forEach</code> loop function, their data sent to
   * <code>inaccessible.assembleDropdownElement</code> for construction of a new
   * dropdown <code>option</code> element.
   *
   * @readonly
   * @enum {!Array<object>}
   * @const
   */
  const Types = Object.freeze({
    ACCOUNT: [
      {
        name: 'Asset',
        value: 'ASSET',
      },
      {
        name: 'Equity',
        value: 'EQUITY',
      },
      {
        name: 'Liability',
        value: 'LIABILITY',
      },
      {
        name: 'Revenue',
        value: 'REVENUE',
      },
      {
        name: 'Expense',
        value: 'EXPENSE',
      },
    ],
    DOCUMENT: [
      {
        name: 'Journal entry',
        value: 'JE',
      },
      {
        name: 'Accounts payable invoice',
        value: 'API',
      },
      {
        name: 'Accounts payable disbursement',
        value: 'APD',
      },
      {
        name: 'Accounts receivable invoice',
        value: 'ARI',
      },
      {
        name: 'Accounts receivable receipt',
        value: 'ARR',
      },
    ],
  });

  // Data arrays

  /**
   * @description This array of objects is used to store data pertaining to the
   * types of interface buttons to be appended to the sidebar. Contained in each
   * object are properties related to name, <code>String</code> representation
   * of the event listener handler function signature associated with that
   * button, and a set of potential arguments to pass as parameters to that
   * function, among other such properties.
   */
  inaccessible.sidebarButtonData = [
    {
      buttonType: Text.DIV_GENERAL_DELETE_ROW,
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
    {
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
    {
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'account'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'account'),
        'buildAccountAdditionModal',
        [],
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
    {
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'document'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'document'),
        'buildDocumentAdditionModal',
        [],
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
    {
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'customer'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'customer'),
        'buildCustomerOrVendorAdditionModal',
        [],
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
    {
      buttonType: Text.DIV_GENERAL_ADD.replace('$1', 'vendor'),
      functionName: 'displayModal',
      functionArguments: [
        Text.DIV_GENERAL_ADD.replace('$1', 'vendor'),
        'buildCustomerOrVendorAdditionModal',
        [],
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
    {
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
    {
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
    {
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
    {
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
   * as well as the option of including a <code>div</code> wrapper.
   * <br />
   * <br />
   * The idea for these links originated with the author's familiarity with the
   * MediaWiki framework and its Monobook skin, the latter of which makes use of
   * a similarly styled set of button elements.
   */
  inaccessible.navlinksButtonData = [
    {
      buttonType: Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP,
      functionName: 'displayModal',
      functionArguments: [
        Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_CHANGEP,
        'buildPasswordChangeModal',
        [],
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
   * @description This one-size-fits-all handler is used in place of the former
   * <code>api</code> object containing individual 'GET' and 'POST' handlers as
   * properties due to the fact that those handlers ended up sharing 99% of the
   * same code. Rather than indulge in copy/pasta, I just consolidated them and
   * made use of an optional default parameter for the data to be passed in the
   * 'POST' handler case. Depending on the other request types we end up needing
   * I may revert to the previous method, but I don't really expect we'll need
   * anything else other than 'GET' and 'POST'. I've tested this in both cases
   * and so far it seems to be working, with post requests passing along the
   * appropriate request headers and data as expected as seen in the browser
   * "Network" tab.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {string} paramType 'GET' or 'POST'
   * @param {string} paramUrl The name of the PHP endpoint i.e. "server.php"
   * @param {!object=} paramData The data in object form to be stringified
   * @returns {Promise}
   */
  inaccessible.sendRequest = function (paramType, paramUrl, paramData = null) {

    // Declarations
    let that, request, params;

    // Preserve scope context
    that = this;

    return new Promise(function (resolve, reject) {

      // Definitions
      request = new XMLHttpRequest();
      request.open(paramType, paramUrl);

      if (paramType === 'POST' && paramData != null) {
        if (paramData.encode === true) {
          // If data is passed as JSON string, we can use JSON REST method
          request.setRequestHeader('Content-Type', 'application/json');
          params = JSON.stringify(paramData.params);
        } else {
          // Query string implementation
          request.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded');
          params = that.serialize(paramData.params);
        }
      }

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
   * @description This utility function is used by
   * <code>inaccessible.sendRequest</code> to determine whether or not the
   * passed <code>paramData</code> optional parameter has been
   * <code>JSON.stringify</code>'ed prior to passage. If it is, the requester
   * uses a JSON-based RESTful approach; otherwise, it uses a query string
   * approach.
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
   * namely <code>$.params</code>. This is primarily for use with sending POST
   * requests in passing argument parameters as the data.
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
   * id or class name.
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
   * id or class name.
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
   * function. This function is only used with the
   * <code>Operations.ADDITION</code> and <code>Operations.SUBTRACTION</code>
   * operations; the comparison operations in the enum require a different
   * invocation method.
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
   * whether or not the inputted object is an array. It will be used by
   * <code>inaccessible.assembleElement</code> to determine if inputted
   * parameters need to be formatted as arrays.
   *
   * @param {object} paramTarget Object to be checked
   * @returns {boolean} Returns <code>true</code> if object is an Array
   */
  inaccessible.isArray = function (paramTarget) {
    return Object.prototype.toString.call(paramTarget) === '[object Array]';
  };

  /**
   * @description This helper utility function is used to check login or account
   * creation data to ensure it is wellformed and alphanumeric. Returns an
   * associated <code>boolean</code> depending on the result of a check with the
   * approved regex.
   *
   * @param {string} paramInput <code>String</code> to be checked
   * @returns {boolean} Returns <code>true</code> if input is alphanumeric
   */
  inaccessible.isLegalInput = function (paramInput) {
    return /^[a-z\d\-_\s]+$/i.test(paramInput);
  };

  /**
   * @description This utility function, like the similar
   * <code>inaccessible.isLegalInput</code>, is used to compare a parameter
   * string against a set of regex to determine whether or not the included
   * monetary amount is properly formatted with decimals in the right places and
   * so forth.
   *
   * @param {string} paramInput String representing amount of money
   * @returns {boolean} Returns <code>true</code> if input is wellformed
   */
  inaccessible.isValidAmount = function (paramInput) {
    return /^\d+(?:\.\d{0,2})$/.test(paramInput);
  };

  /**
   * @description This helper function returns a <code>boolean</code> denoting
   * whether or not the parameter <code>string</code> possesses any characters
   * other than whitespace. It is used primarily to determine whether or not the
   * user has left any pseudo-cells blank when seeking to create a new document.
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
   * like jQuery's <code>$.extend</code>.
   *
   * @param {object} paramTarget The object to be extended
   * @param {object} paramObject The new object to be joined
   * @returns {object}
   */
  inaccessible.extend = function (paramTarget, paramObject) {
    return {...paramTarget, ...paramObject};
  };

  /**
   * @description This pseudo-encoding utility function is used simply to
   * replace spaces with underscores and convert all extant capital letters in
   * the string to lowercase letters. This function may see an expansion that
   * incorporates more advanced encoding via more regex, but the present
   * implementation is sufficient for now.
   *
   * @param {string} paramString
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
   * input date.
   *
   * @param {string} paramDateString String input representing date (YYYY-MM-DD)
   * @returns {boolean}
   */
  inaccessible.isValidDate = function (paramDateString) {

    let fragments, daysInMonth, year, month, day;

    fragments = paramDateString.split('-');
    year = fragments[0];
    month = fragments[1];
    day = fragments[2];
    daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
   * event).
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
   * preassembled DOM elements nested within.
   *
   * @param {object} paramTarget Object to be checked
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
   * page on scene transition immediately after fading out of the scene.
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
   * <code>paramMap</code>.
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
   * available by default in jQuery. As the page will be set to an opacity style
   * value of 0 from the start (namely in the proposed bulk assembly function
   * <code>inaccessible.assembleBodyFramework</code>), this function simply
   * increases the element's opacity until it reaches a value of 1, thus giving
   * the impression of the scene fading in from the start. This helps hide the
   * often jerky page and interface assembly sequence from view for a few
   * milliseconds.
   * <br />
   * <br />
   * Additionally, as of the beginning of November, this function has been
   * refactored and slightly expanded to allow for fading in or out depending on
   * the value of an included <code>String</code> parameter, allowing for
   * seemless transitions between interface scenes as needed.
   *
   * @param {string} paramFadeType <code>String</code> indicating type of fade
   * @param {string} paramElementId Container/wrapper id
   * @return {void}
   */
  inaccessible.fade = function (paramFadeType, paramElementId) {

    // Declarations
    let that, container, interval, fadeTypeObject, fadeTypeParameters;

    // Preserve scope context
    that = this;

    // Grab DOM element from id
    container = document.getElementById(paramElementId);

    // Set default opacity here rather than in config objects
    container.style.opacity = (paramFadeType === 'out') ? 1.005 : 0;

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
   * <br />
   * <br />
   * Originally, the initial implementation of this function involved some janky
   * coding that resulted in the container flickering to the left before
   * starting the animation. The current rewritten implementation should handle
   * such cases and require no CSS-based fixing.
   *
   * @see {@link https://stackoverflow.com/a/29490865|SO Thread}
   * @param {string} paramElementId
   * @return {void}
   */
  inaccessible.swipeRight = function (paramElementId) {

    // Declarations
    let container, interval, startTime, timePassed;

    // Cache start time
    startTime = Date.now();

    // Set container placement to relative
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
      container.style.left = timePassed / 5 + 'px';

    }, Utility.FADE_IN_INTERVAL);
  };

  /**
   * @description This function is used to handle the change of scenes
   * dynamically without having to default to the use of hardcoded HTML.
   * Depending on the input parameters, it generally fades out of the present
   * scene while shifting it right, removes the former content and builds the
   * required interface scene, then fades back in. It's still a bit buggy but it
   * is workable.
   * <br />
   * <br />
   * One optimization I've considered would be a caching function that would
   * preserve the formerly assembled pages in <code>localStorage</code> or in a
   * session cookie, though since the interfaces are not overly complex, it
   * may be fine has it is. We'll have to see how things work out.
   *
   * @param {boolean} paramCanSwipeRight Use <code>swipeRight()</code>
   * @param {string} paramElementId Present container id
   * @param {string} paramBuilderName Builder name
   * @param {!Array<object>=} paramBuilderArgs Function arguments
   * @returns {void}
   */
  inaccessible.tinderize = function (paramCanSwipeRight, paramElementId,
      paramBuilderName, paramBuilderArgs = []) {

    // Declaration
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
      if (container.style.opacity == 0) {
        clearInterval(interval);

        // Remove outdated DOM elements
        that.emptyElementOfContent(parent.id);

        // Build new content
        parent.appendChild(that[paramBuilderName](...paramBuilderArgs));

        // Make any scene-specific adjustments post-addition to page
        that.handlePostLoadAdjustments();

        // Fade in on the scene
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
   * elements that are to exist inside the outer element tags as inner HTML.
   * <br />
   * <br />
   * An example of wellformed input is shown below:
   * <br />
   * <pre>
   * this.assembleElement(
   *   ['div', {id: 'foo-id', class: 'foo-class'},
   *     ['button', {id: 'bar-id', class: 'bar-class'},
   *       'Text'
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
   * of customization doors and is pretty responsive to most button needs.
   * <br />
   * <br />
   * Button objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   buttonType: 'Title here',
   *   functionName: 'handleFoo',
   *   functionArguments: [paramFoo, paramBar],
   *   requiresWrapper: true,
   *   elementId: Identifiers.ID_FOO,
   *   elementClasses: [
   *     Identifiers.CLASS_FOO_1,
   *     Identifiers.CLASS_FOO_2,
   *   ],
   * },
   * </pre>
   *
   * @param {object} paramObject Config as seen above
   * @returns {HTMLElement} buttonElement Assembled element for addition to DOM
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

      buttonElement = this.assembleElement(['div', buttonHolderConfig,
          ['button', buttonConfig, tempName]]);
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
   * dashboard scene, the ledger table itself. Additionally, it makes use of a
   * preformed array of <code>String</code>s in the construction of the table
   * headers. Ideally, these headers in an object array should be tossed and
   * replaced with a better method; this is a bit janked at the moment, but it's
   * good enough for a v.1 build.
   *
   * @param {!Array<string>} paramHeaders
   * @returns {HTMLElement} ledger The formed ledger DOM element
   */
  inaccessible.assembleDashboardTable = function (paramHeaders) {

    // Declaration
    let ledger, thead, tbody, newRow, newCell, configRowHeader, configTable;

    configTable = {
      id: Identifiers.ID_DASHBOARD_LEDGER_TABLE,
      class: Identifiers.CLASS_GENERAL_ARIAL,
      style: 'table-layout: fixed;',
    };

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

    for (let i = 0; i < paramHeaders.length; i++) {
      newCell = newRow.insertCell(i);
      newCell.appendChild(
        this.assembleElement(['th', configRowHeader, paramHeaders[i]])
      );
    }

    return ledger;
  };

  /**
   * @description This assembly function is used to create and return a new
   * dropdown option element for selection in an interaction modal. At the time
   * of writing, this function is used primarily in the addition of document
   * type options to the type selection menu and in the appending of extant
   * customers or vendors to the party selection menu in the same modal.
   * <br />
   * <pre>
   * // Wellformed input object example:
   * paramObject = {
   *   name: 'Accounts payable invoice',
   *   value: 'api',
   * };
   * </pre>
   *
   * @param {object} paramObject Document type config object
   * @returns {HTMLElement} The assembled dropdown option element
   */
  inaccessible.assembleDropdownElement = function (paramObject) {
    return this.assembleElement('option', {
      value: paramObject.value,
      id: Identifiers.ID_DOCUMENT_DROPDOWN_OPTION + '-' + paramObject.value,
      class: Identifiers.CLASS_MODAL_DROPDOWN_OPTION,
    }, paramObject.name);
  };

  // Builder functions

  /**
   * @description Replacing the previous
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
   * @param {HTMLElement} paramContent
   * @returns {HTMLElement}
   */
  inaccessible.buildLoginModule = function (paramContent) {

    // Declarations
    let configContainer, configTopbar, configTopbarHolder, configTopbarTitle,
      configTopbarSubtitle, configMain;

    configContainer = {
      id: Identifiers.ID_LOGIN_CONTAINER,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION + ' ' +
        Identifiers.CLASS_GENERAL_CONTAINER,
    };

    configTopbar = {
      id: Identifiers.ID_LOGIN_TOPBAR,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configTopbarHolder = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_HOLDER,
      class: Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING,
    };

    configTopbarTitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_TITLE,
      class: Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    configTopbarSubtitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_SUBTITLE,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configMain = {
      id: Identifiers.ID_LOGIN_MAIN,
    };

    this.scene = Scenes.LOGIN;

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
   * new users.
   *
   * @param {!Array<object>} paramButtons Array of <code>ModuleButtons</code>
   * @returns {HTMLElement}
   */
  inaccessible.buildLoginContent = function (paramButtons) {

    let configContent, configBody, configBodyHeader, configBodyLoginHolder,
      configBodyLoginUsername, configBodyLoginPassword, configFooter,
      configButtonsHolder;

    configContent = {
      id: Identifiers.ID_LOGIN_CONTENT,
    };

    configBody = {
      id: Identifiers.ID_LOGIN_BODY,
    };

    configBodyHeader = {
      id: Identifiers.ID_LOGIN_BODY_HEADER,
      class: Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING + ' ' +
        Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configBodyLoginHolder = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_HOLDER,
    };

    configBodyLoginUsername = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_USERNAME,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_USERNAME_PLACEHOLDER,
      type: 'text',
    };

    configBodyLoginPassword = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_PASSWORD,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    configFooter = {
      id: Identifiers.ID_LOGIN_FOOTER,
    };

    configButtonsHolder = {
      id: Identifiers.ID_LOGIN_FOOTER_BUTTONS_HOLDER,
      class: Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

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
   * returning to the login module and submitting new account data.
   *
   * @param {!Array<object>} paramButtons Array of <code>ModuleButtons</code>
   * @returns {HTMLElement}
   */
  inaccessible.buildAccountCreationContent = function (paramButtons) {

    let configContent, configBody, configBodyHeader, configBodyLoginHolder,
      configBodyLoginUsername, configBodyLoginPassword, configBodyLoginReenter,
      configFooter, configButtonsHolder;

    configContent = {
      id: Identifiers.ID_LOGIN_CONTENT,
    };

    configBody = {
      id: Identifiers.ID_LOGIN_BODY,
    };

    configBodyHeader = {
      id: Identifiers.ID_LOGIN_BODY_HEADER,
      class: Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING + ' ' +
        Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configBodyLoginHolder = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_HOLDER,
    };

    configBodyLoginUsername = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_USERNAME,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_USERNAME_PLACEHOLDER,
      type: 'text',
    };

    configBodyLoginPassword = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_PASSWORD,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    configBodyLoginReenter = {
      id: Identifiers.ID_LOGIN_BODY_INPUT_REENTER,
      class: Identifiers.CLASS_LOGIN_BODY_INPUT_TEXTBOX,
      placeholder: Text.INPUT_LOGIN_BODY_REENTER_PLACEHOLDER,
      type: 'password',
    };

    configFooter = {
      id: Identifiers.ID_LOGIN_FOOTER,
    };

    configButtonsHolder = {
      id: Identifiers.ID_LOGIN_FOOTER_BUTTONS_HOLDER,
      class: Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

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
   * @description This function makes significant use of the DOM element builder
   * <code>inaccessible.assembleElement</code>'s recursive functionality to
   * construct many levels of nested elements. This function mainly just fills
   * the otherwise empty <code>body</code> tag with a container wrapper
   * <code>div</code>, a set of sidebar containers for checkboxes and buttons,
   * and a <code>div</code> wrapper for the central ledger element itself. It is
   * to these DOM nodes that the rest of the elements are assembled dynamically
   * and added to the wrapper.
   * <br />
   * <br />
   * This particular builder is responsible for constructing the main interface
   * dashboard page scene, viewable on account login.
   *
   * @returns {HTMLElement} The constructed page scene
   */
  inaccessible.buildUserInterface = function () {

    // Declarations
    let configContainer, configTopbar, configTopbarMeta, configTopbarMetaTitle,
      configTopbarMetaSubtitle, configTopbarNavLinks,
      configTopbarNavLinksHolder, configSection, configSidebar,
      configSidebarButtonContainer, configLedger, configLedgerTable;

    configContainer = {
      id: Identifiers.ID_DASHBOARD_CONTAINER,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION + ' ' +
        Identifiers.CLASS_GENERAL_CONTAINER,
    };

    configTopbar = {
      id: Identifiers.ID_DASHBOARD_TOPBAR,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configTopbarMeta = {
      id: Identifiers.ID_DASHBOARD_TOPBAR_META,
      class: Identifiers.CLASS_GENERAL_TOPBAR_DIV,
    };

    configTopbarMetaTitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_TITLE,
      class: Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    configTopbarMetaSubtitle = {
      id: Identifiers.ID_GENERAL_TOPBAR_META_SUBTITLE,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configTopbarNavLinks = {
      id: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS,
      class: Identifiers.CLASS_GENERAL_TOPBAR_DIV,
    };

    configTopbarNavLinksHolder = {
      id: Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_HOLDER,
    };

    configSection = {
      id: Identifiers.ID_DASHBOARD_SECTION,
      class: Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

    configSidebar = {
      id: Identifiers.ID_DASHBOARD_SIDEBAR,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configSidebarButtonContainer = {
      id: Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS,
    };

    configLedger = {
      id: Identifiers.ID_DASHBOARD_LEDGER,
      class: Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

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
            this.assembleDashboardTable(TableHeaders.DOCUMENTS),
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
   * required.
   *
   * @param {string} paramTitle Modal title
   * @param {HTMLElement} paramContent Inner HTML content
   * @param {!Array<object>} paramButtons Array of button config objects
   * @returns {HTMLElement}
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

    // Module div
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

    // Empty main section to which other builds will be appended
    configSection = {
      id: Identifiers.ID_MODAL_SECTION,
      class: Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Section for buttons
    configFooter = {
      id: Identifiers.ID_MODAL_FOOTER,
      class: Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Container for the footer buttons
    configFooterButtons = {
      id: Identifiers.ID_MODAL_FOOTER_BUTTONS,
    };

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
   * @description This builder function is responsible for building the modal
   * mini-scene related to the password changing process. It assembles a bit of
   * HTML including a pair of password entry input textfields and a set of
   * wrapper container divs and some text instructing the user to enter matched
   * passwords.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildPasswordChangeModal = function () {

    let configContainer, configInformation, configInputForm,
      configInputPassword, configInputPasswordReentered;

    configContainer = {
      id: Identifiers.ID_CHANGEP_CONTAINER,
    };

    configInformation = {
      id: Identifiers.ID_CHANGEP_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configInputForm = {
      id: Identifiers.ID_CHANGEP_FORM,
    };

    configInputPassword = {
      id: Identifiers.ID_CHANGEP_INPUT_PASSWORD,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CHANGEP_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    configInputPasswordReentered = {
      id: Identifiers.ID_CHANGEP_INPUT_REENTER,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CHANGEP_REENTER_PLACEHOLDER,
      type: 'password',
    };

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
   * need for a duplicate copy/pasted builder for each.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildCustomerOrVendorAdditionModal = function () {

    // Declarations
    let configContainer, configInformation, configInputForm,
      configInputName, configInputAddress;

    configContainer = {
      id: Identifiers.ID_CORV_CONTAINER,
    };

    configInformation = {
      id: Identifiers.ID_CORV_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configInputForm = {
      id: Identifiers.ID_CORV_FORM,
    };

    configInputName = {
      id: Identifiers.ID_CORV_INPUT_NAME,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CORV_NAME_PLACEHOLDER,
      type: 'text',
    };

    configInputAddress = {
      id: Identifiers.ID_CORV_INPUT_ADDRESS,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_CORV_ADDRESS_PLACEHOLDER,
      type: 'text',
    };

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
   * type dropdown.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildDocumentAdditionModal = function () {

    // Declarations
    let that, configContainer, configInformation, configTypeDropdown,
      configTypeDropdownOption, configPartyDropdown, configPartyDropdownOption,
      typeDropdown, typeDropdownOption, configDropdownHolder, configDocName,
      configDocNameHolder, configEntriesHolder, configEntriesForm,
      documentName;

    // Preserve scope
    that = this;

    configContainer = {
      id: Identifiers.ID_DOCUMENT_CONTAINER,
    };

    configInformation = {
      id: Identifiers.ID_DOCUMENT_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configDocNameHolder = {
      id: Identifiers.ID_DOCUMENT_INPUT_NAME_HOLDER,
    };

    configDocName = {
      id: Identifiers.ID_DOCUMENT_INPUT_NAME,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_DOCUMENT_NAME_PLACEHOLDER,
      type: 'text',
    };

    configDropdownHolder ={
      id: Identifiers.ID_DOCUMENT_DROPDOWN_HOLDER,
    };

    configTypeDropdown = {
      id: Identifiers.ID_DOCUMENT_DROPDOWN_TYPE,
      class: Identifiers.CLASS_MODAL_DROPDOWN,
    };

    configPartyDropdown = {
      id: Identifiers.ID_DOCUMENT_DROPDOWN_PARTY,
      class: Identifiers.CLASS_MODAL_DROPDOWN,
    };

    configPartyDropdownOption = {
      id: Identifiers.ID_DOCUMENT_DROPDOWN_OPTION + '-default',
      class: Identifiers.CLASS_MODAL_DROPDOWN_OPTION,
    };

    configEntriesHolder = {
      id: Identifiers.ID_DOCUMENT_TABLE_HOLDER,
    };

    configEntriesForm = {
      id: Identifiers.ID_DOCUMENT_TABLE,
    };

    this.scene = Scenes.MODAL;

    // Document type dropdown menu
    documentName = this.assembleElement(['input', configDocName]);
    typeDropdown = this.assembleElement(['select', configTypeDropdown]);

    // Listener for changes to document type dropdown menu
    typeDropdown.addEventListener('change', function () {
      that.handleDocumentDropdownChange.call(that, typeDropdown);
    }, false);

    // Build all five document type options
    Types.DOCUMENT.forEach(function (doctype) {
      typeDropdown.appendChild(that.assembleDropdownElement(doctype));
    });

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          Text.DIV_DOCUMENT_INFORMATION,
        ],
        ['div', configDocNameHolder,
          documentName,
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
            this.buildDocumentAdditionTableRow()
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
   * <code>form</code> approach, wherein rows are simply groups of input
   * elements bound within a <code>div</code>.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildDocumentAdditionTableRow = function () {

    let that, configWrapper, configDelete, configCode, configDate,
      configDropdown, configDropdownOptionCredit, configDropdownOptionDebit,
      configAmount, configDescription;

    that = this;

    configWrapper = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_WRAPPER,
    };

    configDelete = {
      type: 'checkbox',
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    configCode = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_CODE_PLACEHOLDER,
      type: 'text',
    };

    configDate = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_DATE_PLACEHOLDER,
      type: 'text',
    };

    configDropdown = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_DROPDOWN,
    };

    configDropdownOptionCredit = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    configDropdownOptionDebit = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL,
    };

    configAmount = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_AMOUNT_PLACEHOLDER,
      type: 'text',
    };

    configDescription = {
      class: Identifiers.CLASS_DOCUMENT_TABLE_ROW_CELL + ' ' +
        Identifiers.CLASS_DOCUMENT_TABLE_ROW_INPUT,
      placeholder: Text.INPUT_DOCUMENT_DESCRIPTION_PLACEHOLDER,
      type: 'text',
    };

    return this.assembleElement(
      ['div', configWrapper,
        ['input', configDelete],
        ['input', configCode],
        ['input', configDate],
        ['select', configDropdown,
          ['option', configDropdownOptionCredit,
            Text.INPUT_DOCUMENT_OPTION_CREDIT,
          ],
          ['option', configDropdownOptionDebit,
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
   * associated with the "Add account" sidebar button.
   *
   * @returns {void}
   */
  inaccessible.buildAccountAdditionModal = function () {

    // Declarations
    let that, configContainer, configInformation, configInputHolder,
      configInputForm, configInputCode, configInputName, configDropdownHolder,
      configTypeDropdown, typeDropdown;

    that = this;

    configContainer = {
      id: Identifiers.ID_ADDACC_CONTAINER,
    };

    configInformation = {
      id: Identifiers.ID_ADDACC_INFORMATION,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configInputHolder= {
      id: Identifiers.ID_ADDACC_INPUT_HOLDER,
    };

    configInputForm = {
      id: Identifiers.ID_ADDACC_FORM,
    };

    configInputCode = {
      id: Identifiers.ID_ADDACC_INPUT_CODE,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_ADDACC_CODE_PLACEHOLDER,
      type: 'text',
    };

    configInputName = {
      id: Identifiers.ID_ADDACC_INPUT_NAME,
      class: Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: Text.INPUT_ADDACC_NAME_PLACEHOLDER,
      type: 'text',
    };

    configDropdownHolder ={
      id: Identifiers.ID_ADDACC_DROPDOWN_HOLDER,
    };

    configTypeDropdown = {
      id: Identifiers.ID_ADDACC_DROPDOWN_TYPE,
      class: Identifiers.CLASS_MODAL_DROPDOWN,
    };

    typeDropdown = this.assembleElement(['select', configTypeDropdown])

    // Build all five account type options
    Types.ACCOUNT.forEach(function (accountType) {
      typeDropdown.appendChild(that.assembleDropdownElement(accountType));
    });

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
   * successful or unsuccessful.
   *
   * @param {!Array<object>} paramAccountsAdded
   * @returns {HTMLElement}
   */
  inaccessible.buildDefaultAccountsModal = function (paramAccountsAdded) {

    // Declarations
    let that, accountsListHolder, accountsList, accountListElement,
      singleAccountSummary, configContainer, configInformation,
      configListHolder, configList, configListElement, success;

    // Preserve scope
    that = this;

    success = false;

    configContainer = {
      id: Identifiers.ID_DEFAULT_CONTAINER,
      class: Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configInformation = {
      id: Identifiers.ID_DEFAULT_INFORMATION,
    };

    configListHolder = {
      id: Identifiers.ID_DEFAULT_LIST_HOLDER,
    };

    configList = {
      id: Identifiers.ID_DEFAULT_LIST,
    };

    configListElement = {
      class: Identifiers.CLASS_DEFAULT_LIST_ELEMENT,
    };

    if (paramAccountsAdded != null && paramAccountsAdded.length) {
      success = true;

      // Build unorder list and holder
      accountsListHolder = this.assembleElement(['div', configListHolder]);
      accountsList = this.assembleElement(['ul', configList]);

      // Create a new list element for each account added
      paramAccountsAdded.forEach(function (account) {
        singleAccountSummary = that.replaceAll(Text.DIV_DEFAULT_SUMMARY, {
          '#1': account.code,
          '#2': account.name,
          '#3': account.type.toLowerCase(),
        });

        accountsList.appendChild(
          that.assembleElement(['li', configListElement, singleAccountSummary])
        );
      });

      // Add completed list to holder
      accountsListHolder.appendChild(accountsList);
    }

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
   * function <code>inaccessible.tinderize</code>.
   *
   * @param {object} paramTableConfig
   * @param {!Array<object>} paramRows
   * @returns {HTMLElement} newTable
   */
  inaccessible.buildTable = function (paramTableConfig, paramRows) {

    // Declarations
    let that, newTable;

    // Definitions
    that = this;
    newTable = this.assembleDashboardTable(paramTableConfig.headers);

    paramRows.forEach(function (row) {
      that.displayTableRow(row, newTable, paramTableConfig);
    });

    this.scene = Scenes.DASHBOARD;

    return newTable;
  };

  /**
   * @description This simple builder function is used specifically as a fast,
   * convenient way of assembling a wrapper <code>div</code> and the buttons
   * denoted in one of the script-global namespace arrays, either
   * <code>inaccessible.sidebarButtonData</code> or
   * <code>inaccessible.navlinksButtonData</code>.
   *
   * @param {object} paramConfig This object contains attributes for wrapper
   * @param {!Array<object>} paramButtons The script-global array
   * @returns {HTMLElement} buttonHolder The constructed buttons listing
   */
  inaccessible.buildButtonsListing = function (paramConfig, paramButtons) {

    // Declaration
    let that, buttonHolder;

    // Definitions
    that = this;
    buttonHolder = this.assembleElement(['div', paramConfig]);

    // Create new button instance and add to wrapper
    paramButtons.forEach(function (button) {
      buttonHolder.appendChild(that.assembleButtonElement(button));
    });

    // Return wrapper and buttons
    return buttonHolder;
  };

  // Display functions

  /**
   * @description As per the standard usage of display functions, this function
   * is responsible for building a mini-scene and adding it to the DOM rather
   * than returning it from the function. It also determines what buttons are
   * shown in the footer of the modal, the number and type of which are
   * determined by the inclusion of an optional <code>paramHandlerName</code>
   * string denoting the custom submission button press event handler used to
   * collate and transmit user data to the back end. If no such parameter is
   * included, only the close modal button is included in the footer.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {string} paramModalTitle
   * @param {string} paramMiniSceneBuilder
   * @param {!Array<>} paramMiniSceneBuilderArgs
   * @param {!Array<object>=} paramButtonsArray Optional buttons array
   * @param {!string=} paramHandlerName The optional submission handler string
   * @returns {void}
   */
  inaccessible.displayModal = function (paramModalTitle, paramMiniSceneBuilder,
      paramMiniSceneBuilderArgs = [], paramButtonsArray = [],
      paramHandlerName = null) {

    // Declarations
    let that, innerContent, submitButtonCopy, buttons, modal, modalMain;

    // Preserve scope
    that = this;

    // Inner modal mini-scene
    innerContent = this[paramMiniSceneBuilder](...paramMiniSceneBuilderArgs);

    // Define array for button configs
    buttons = [];

    // If an input handler exists, we will need submit button and clear button
    if (paramHandlerName != null) {

      // Make shallow copy of default submit button config
      submitButtonCopy = this.extend({}, ModalButtons.SUBMIT);

      // Adjust handler function String representation in submit button config
      submitButtonCopy.functionName = paramHandlerName;

      // Need submission handler button and input clearing button
      buttons.push(submitButtonCopy);
    }

    // Add buttons if param buttons array is not empty
    if (paramButtonsArray.length > 0) {
      paramButtonsArray.forEach(function (button) {
        buttons.push(button);
      });
    }

    // Modal close button must always be present
    buttons.push(ModalButtons.CLOSE);

    // Build modal using config
    modal = this.buildModal(paramModalTitle, innerContent, buttons);

    // Add event listener for clicks outside main modal window
    modal.addEventListener('click', function handleOutsideClicks (event) {
      modalMain = document.getElementById(Identifiers.ID_MODAL_MAIN);

      if (modalMain == null || !modalMain.contains(event.target)) {
        if (modalMain != null) {
          that.handleModalClose();
        }

        modal.removeEventListener('click', handleOutsideClicks);
      }
    }, false);

    // Build and add the modal to the body at the bottom
    document.body.appendChild(modal);
  };

  /**
   * @description This display function is deals with the insertion of rows to
   * the main ledger table. It could use some work, but when provided an object
   * with the required properties (presumably originating from a related
   * <code>JSON</code> file), it will produce a new line and append it to the
   * present table listing. Required: Addition of relevant back-end code to
   * handle addition of user data in some form.
   *
   * @param {object} paramRowObject
   * @param {HTMLElement} paramTable
   * @param {object} paramTableConfig
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

    // This is a messy step assuming the row data is in object & not array form
    for (let key in paramRowObject) {
      valuesArray.push(paramRowObject[key]);
    }

    // Individual config for this checkbox
    configCheckbox = {
      type: 'checkbox',
      class: Identifiers.CLASS_DASHBOARD_LEDGER_TABLE_CHECKBOX,
    };

    configButton = {
      class: Identifiers.CLASS_GENERAL_LINK_BUTTON,
    };

    for (let i = 0; i < columnCount; i++) {
      newCell = newRow.insertCell(i);

      // Journal Entries will have no party, so set as N/A
      if (valuesArray[i - 1] == null && i > 0) {
        valuesArray[i - 1] = 'N/A';
      }

      if (paramTableConfig.useTextNodesOnly && i > 0) {
        newCell.appendChild(document.createTextNode(valuesArray[i - 1]));
        continue;
      }

      switch (i) {
        case 0: // Deletion checkbox
          newCell.appendChild(this.assembleElement(['input', configCheckbox]));
          break;
        case 1: // Add link button in certain contexts
          newButton = this.assembleElement(['button', configButton,
            valuesArray[i - 1]]);

          newButton.addEventListener('click', function () {
            console.warn(`Not yet complete: ${valuesArray[i - 1]}`);
            that.handleTableDataLoading('ledger_rows', valuesArray[i - 1]);
          }, false);

          newCell.appendChild(newButton);
          break;
        default:
          newCell.appendChild(document.createTextNode(valuesArray[i - 1]));
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
   * of <code>inaccessible.scene</code>.
   *
   * @param {boolean} paramIsSuccess
   * @param {string} paramMessage
   * @return {void}
   */
  inaccessible.displayStatusNotice = function (paramIsSuccess, paramMessage) {

    // Declarations
    let configStatusDiv, location, status, statusDiv, extantNotice;

    // Choose class name fragment based on success of action
    status = (paramIsSuccess) ? 'SUCCESS' : 'FAILURE';

    configStatusDiv = {
      id: Identifiers.ID_GENERAL_STATUS_DIV,
      class: Identifiers.CLASS_GENERAL_OPENSANS + ' ' +
        Identifiers[`CLASS_GENERAL_STATUS_${status}`]
    };

    // Duild the <biv>
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
        location = Identifiers.ID_MODAL_SECTION;
        break;
    }

    // Add the bottom of body and above buttons
    this.append(location, statusDiv);
  };

  // Handler functions

  /**
   * @description This function is the handler related to the creation of a new
   * user account. Under its current construction, it validates the new username
   * and password, ensuring that only alphanumeric characters are permitted in
   * either entry. Once validated, the data is passed to the relevant endpoint,
   * namely <code>create_user</code>, and the result of the creation operation
   * is displayed as a status notice.
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

    // Alphanumeric data only
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

    // Send POST request
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

      if (data.success) {
        that.displayStatusNotice(true, Text.SUCCESS_ACCOUNT_CREATED);
      } else {
        if (data.duplicate) {
          that.displayStatusNotice(false, Text.ERROR_ACCOUNT_EXISTS);
        } else {
          that.displayStatusNotice(false, Text.ERROR_ACCOUNT_OTHERERROR);
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
   * function name and an array of strings representing
   * <code>ModuleButtons</code> to include in the module footer. Using these, a
   * new body content framework is constructed, disguised by way of fade-ins and
   * fade-outs.
   *
   * @param {string} paramBuilder
   * @param {!Array<string>} paramButtons
   * @returns {void}
   */
  inaccessible.handleLoginSceneChanges = function (paramBuilder, paramButtons) {

    // Declaration
    let buttonsArray;

    // Definition
    buttonsArray = [];

    paramButtons.forEach(function (buttonString) {
      buttonsArray.push(ModuleButtons[buttonString]);
    });

    this.tinderize(false, Identifiers.ID_LOGIN_CONTENT, paramBuilder,
      [buttonsArray]);
  };

  /**
   * @description This handler function is invoked once the user has pressed the
   * "Login" button in the login modal scene. It grabs the values inputted by
   * the user in the username and password input textboxes and calls
   * <code>inaccessible.isLegalInput</code> for each <code>String</code> to
   * ensure that input is alphanumeric in nature. If it is wellformed input, the
   * handler <code>inaccessible.tinderize</code> is called to shift the scene to
   * the right while fading out before clearing the DOM and building the next
   * scene.
   *
   * @returns {void}
   */
  inaccessible.handleLogin = function () {

    // Declarations
    let that, username, password, data;

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

    if (TESTING) {
      this.tinderize(true, Identifiers.ID_LOGIN_CONTAINER,
        'buildUserInterface');
      return;
    }

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

      if (data.isLogonSuccessful) {
        that.tinderize(true, Identifiers.ID_LOGIN_CONTAINER,
          'buildUserInterface');
      } else {
        that.displayStatusNotice(false, Text.ERROR_LOGIN_FAILED);
        return;
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, Text.ERROR_NETWORK);
    });
  };

  /**
   * @description Handler for presses of the "Logout" button option in the
   * upper-right toolbar. This function simply calls the scene shifting function
   * <code>inaccessible.tinderize</code> to return to the login modal at the
   * moment.
   *
   * @returns {void}
   */
  inaccessible.handleLogout = function () {

    if (!TESTING) {
      this.sendRequest('POST', 'php/logout.php');
    }

    this.tinderize(true, Identifiers.ID_DASHBOARD_CONTAINER,
      'buildLoginModule', [this.buildLoginContent(
      [ModuleButtons.CREATE_ACCOUNT, ModuleButtons.LOGIN])]);

    this.focusOnLoad(`#${Identifiers.ID_LOGIN_BODY_INPUT_USERNAME}`,
      Utility.CHECK_OPACITY_RATE);
  };

  /**
   * @description As the name implies, this handler is used to close the modal
   * window on the press of the appropriate in-modal button. It basically just
   * removes the entire window from the view model without any transitions or
   * anything.
   *
   * @returns {void}
   */
  inaccessible.handleModalClose = function () {

    // Declaration
    let modal;

    // Grab element
    modal = document.getElementById(Identifiers.ID_MODAL_BLACKOUT);

    // Remove
    modal.parentNode.removeChild(modal);

    // Reset scene to dashboard
    this.scene = Scenes.DASHBOARD;
  };

  /**
   * @description This function is used to clear the input textboxes present on
   * certain modal bodies (the mini-scenes) on the press of the "clear" button.
   * It works by collecting in an <code>HTMLCollection</code> all the textbox
   * elements with a certain class that are contained in the body of the modal.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormClear = function () {

    // Declaration
    let textboxes, statusNotice;

    // Grab the input textboxes in the main modal section body
    textboxes = document
      .getElementById(Identifiers.ID_MODAL_SECTION)
      .getElementsByClassName(Identifiers.CLASS_MODAL_SECTION_TEXTBOX);

    // Grab any extant success/failure action notice
    statusNotice = document.getElementById(Identifiers.ID_GENERAL_STATUS_DIV);

    // Remove if present
    if (statusNotice) {
      statusNotice.remove();
    }

    // Set each input value as an empty string
    for (let textbox of textboxes) {
      textbox.value = '';
    }
  };

  /**
   * @description This handler is used to handle the submission of user data on
   * the press of the "Submit" button. This is the default handler present in
   * the <code>ModalButtons</code> enum and may be overridden by any
   * implementing functions that shallow copy the appropriate button config
   * object and adjust the <code>functionName</code> handler string.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormSubmit = function () {
    window.alert('Submit data!');
  };

  /**
   * @description This function handler is used to add a new pseudo-table row to
   * the document addition modal's form table.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormRowAddition = function () {
    document.getElementById(Identifiers.ID_DOCUMENT_TABLE)
      .appendChild(this.buildDocumentAdditionTableRow());
  };

  /**
   * @description This handler is simply responsible for printing the contents
   * of the currently viewed ledger on presses of the "Print ledger" button.
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
   * of the page content. Post-load adjustments are scene specific.
   * <br />
   * <br />
   * For the dashboard table scenes, this function is used to manually adjust
   * the width of each table cell depending on the number of headers present in
   * that table. For instance, the accounts table has a total of four headers,
   * thus, the width of each column would be the width of the table divided by
   * the number of headers.
   *
   * @returns {void}
   */
  inaccessible.handlePostLoadAdjustments = function () {

    let table, rows, index;

    switch (this.scene) {
      case 2: // Dashboard
        table = document.getElementById(Identifiers.ID_DASHBOARD_LEDGER_TABLE);
        rows = table.rows;

        for (let row of rows) {
          index = 0;
          for (let cell of row.cells) {
            if (index++ === 0) {
              cell.style.width = `${Utility.DELETE_CHECKBOX_CELL_WIDTH}px`;
            } else {
              cell.style.width =
                `${(table.offsetWidth - Utility.DELETE_CHECKBOX_CELL_WIDTH) /
                  (row.cells.length - 1)}px`;
            }
          }
        }
        break;
      default:
        return;
    }
  };

  /**
   * @description This presently noop'ed function will be used to toggle between
   * the documents overview table and the general ledger table on the press of
   * the appropriate sidebar button.
   *
   * @param {string} paramTable Either "documents," "ledger," or "accounts"
   * @param {!string=} paramDoc Document whose ledger rows are requested
   * @returns {void}
   */
  inaccessible.handleTableDataLoading = function (paramTable, paramDoc = null) {

    let that, requestDataOptions, selectedTable, data;

    that = this;

    requestDataOptions = {
      documents: {
        name: 'documents',
        endpoint: 'get_documents',
        headers: TableHeaders.DOCUMENTS,
        useTextNodesOnly: false,
        params: {},
      },
      ledger_rows: {
        name: 'ledger_rows',
        endpoint: 'get_general_ledger_rows',
        headers: TableHeaders.LEDGER,
        useTextNodesOnly: true,
        params: {
          documentName: paramDoc,
        },
      },
      accounts: {
        name: 'accounts',
        endpoint: 'get_accounts',
        headers: TableHeaders.ACCOUNTS,
        useTextNodesOnly: true,
        params: {},
      },
      vendors: {
        name: 'vendors',
        endpoint: 'get_vendors',
        headers: TableHeaders.PARTIES,
        useTextNodesOnly: true,
        params: {},
      },
      customers: {
        name: 'customers',
        endpoint: 'get_customers',
        headers: TableHeaders.PARTIES,
        useTextNodesOnly: true,
        params: {},
      }
    };

    selectedTable = requestDataOptions[paramTable];

    this.scene = Scenes.DASHBOARD;

    this.sendRequest(
      'GET',
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

      if (data.success) {
        that.tinderize(false, Identifiers.ID_DASHBOARD_LEDGER_TABLE,
          'buildTable', [selectedTable, data[paramTable]]);
      } else {
        console.warn('DISPLAY ERROR MESSAGE VIA window.alert');
        return;
      }
    }, function (error) {
      console.warn(error);
    });
  };

  /**
   * @description This function is used to handle cases wherein the user elects
   * to change his/her password. In such cases, the user must enter the new
   * password twice and ensure they match before the POST request can be made to
   * the server. Assuming the password are alphanumeric in nature, any password
   * combinations are permitted.
   * <br />
   * <br />
   * The handler is a custom substitute for the default "Submit" button in the
   * modal interface, and is thus used specifically in the "Change password"
   * modal window.
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
   * related to new documents. It individually evaluated and validates all of
   * the fields for the document name, the type, the party involved in the
   * entry, and the input fields for each of the new ledger entries to be
   * included in the ledger. It does by making use of a number of utility
   * functions used to validate input and ensure that only proper wellformed
   * data is provided to the server by means of the <code>add_document</code>
   * endpoint.
   *
   * @returns {void}
   */
  inaccessible.handleDocumentAddition = function () {

    // Declarations
    let that, data, input, entryRows, index, documentName, type, party,
      generalLedgerRows, ledgerRowObject, credebit, wasProblemDetected;

    // Initial definitions
    that = this;
    input = {};
    wasProblemDetected = false;

    // Grab values and HTMLCollection
    documentName =
      document.getElementById(Identifiers.ID_DOCUMENT_INPUT_NAME).value;
    type =
      document.getElementById(Identifiers.ID_DOCUMENT_DROPDOWN_TYPE).value;
    party =
      document.getElementById(Identifiers.ID_DOCUMENT_DROPDOWN_PARTY).value;
    entryRows = document
      .getElementById(Identifiers.ID_DOCUMENT_TABLE)
      .getElementsByClassName(Identifiers.CLASS_DOCUMENT_TABLE_ROW_WRAPPER);

    // Check document name
    if (!this.isLegalInput(documentName)) {
      this.displayStatusNotice(false, Identifiers.ERROR_DOCU_NAME_ANUMER);
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

    // If we break'd (lulz) from the outer loop, we don't want to proceed
    if (wasProblemDetected) {
      if (DEBUG) {
        console.warn('Problem was detected - [handleDocumentAddition]');
      }
      return;
    }

    if (DEBUG) {
      console.log(input);
    }

    if (TESTING) {
      this.displayStatusNotice(true, Text.SUCCESS_DOCU_CREATED);
      this.handleTableDataLoading('documents');
      return;
    }

    this.sendRequest('POST', 'php/add_document.php', {
      encode: true,
      params: input,
    }).then(function (response) {

      // Parse the JSON response into a usable object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      if (data.success) {
        that.displayStatusNotice(true, Text.SUCCESS_DOCU_CREATED);
        that.handleTableDataLoading('documents');
      } else {
        that.displayStatusNotice(false, Text.ERROR_DOCU_OTHERERROR);
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
   * vendors previously entered by the user at some point.
   * <br />
   * <br />
   * For example, if the user had entered a vendor named "Baltimore Gas and
   * Electric" and decided to create a new accounts payable invoice document,
   * this handler would query the database via a GET request for a listing of
   * vendors, displaying BGE as a possible option for selection by the user.
   *
   * @param {HTMLElement} paramMenu
   * @returns {void}
   */
  inaccessible.handleDocumentDropdownChange = function (paramMenu) {

    // Declarations
    let that, selectedOption, endpoint, partyType, data, partyDropdown,
      extantParties, dropdownElementConfig;

    // Definitions
    that = this;
    selectedOption = paramMenu.value;

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

    // Journal entry selected
    if (partyType == null) {
      return;
    }

    // Either get_vendors or get_customers
    endpoint = (TESTING)
      ? `json/get_${partyType}.json`
      : `php/get_${partyType}.php`;

    this.sendRequest('GET', endpoint).then(function (response) {

      // Parse JSON for use in loop
      data = JSON.parse(response);

       // Array of customers or vendors
      extantParties = data[partyType];

      // Dropdown menu for display of extant customers or vendors
      partyDropdown =
        document.getElementById(Identifiers.ID_DOCUMENT_DROPDOWN_PARTY);

      if (DEBUG) {
        console.log(data);
      }

      if (data.success) {
        if (extantParties.length > 0) {

          // Remove all but the first
          partyDropdown.options.length = 1;

          // This approach will need some refactoring in future
          extantParties.forEach(function (party) {

            // Build new element config (value: "Joe Blow" -> joe_blow)
            dropdownElementConfig = {
              name: party.name,
              value: that.encode(party.name),
            };

            partyDropdown.appendChild(
              that.assembleDropdownElement(dropdownElementConfig));
          });
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
   * involved, removes the need for a second duplicate copy/pasta handler.
   *
   * @returns {void}
   */
  inaccessible.handleCustomerOrVendorAddition = function () {

    // Declarations
    let that, name, address, headerText, partyType, endpoint, data;

    // Preserve scope
    that = this;

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

    // Alphanumeric data only for username and password
    if (!this.isLegalInput(name) || !this.isLegalInput(address)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

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

        // Entry already exists
        if (data.duplicate) {
          that.displayStatusNotice(false, Text.ERROR_CORV_DUPLICATE);
        } else {
          that.displayStatusNotice(false, Text.ERROR_CORV_OTHERERROR);
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
   * and type off to the <code>add_account</code> PHP endpoint.
   *
   * @returns {void}
   */
  inaccessible.handleAccountAddition = function () {

    // Declarations
    let that, code, name, type;

    // Preserve scope
    that = this;

    // Grab input field values
    code = document.getElementById(Identifiers.ID_ADDACC_INPUT_CODE).value;
    name = document.getElementById(Identifiers.ID_ADDACC_INPUT_NAME).value;
    type = document.getElementById(Identifiers.ID_ADDACC_DROPDOWN_TYPE).value;

    if (isNaN(code)) {
      this.displayStatusNotice(false, Text.ERROR_DOCU_CODE_NUMER);
      return;
    }

    // Alphanumeric data only for name
    if (!this.isLegalInput(name)) {
      this.displayStatusNotice(false, Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

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
      } else {

        // Entry already exists
        if (data.duplicate) {
          that.displayStatusNotice(false, Text.ERROR_ADDACC_DUPLICATE);
        } else {
          that.displayStatusNotice(false, Text.ERROR_ADDACC_OTHERERROR);
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
   * status modal informing the user of the success of the operation.
   *
   * @returns {void}
   */
  inaccessible.handleDefaultAccountsAddition = function () {

    // Declarations
    let that, data;

    // Preserve scope
    that = this;

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

      if (TESTING) {
        that.displayModal(Text.DIV_GENERAL_DEFAULT_ACCOUNTS,
          'buildDefaultAccountsModal', [data]);
        return;
      }

      if (data.success) {
        that.displayModal(Text.DIV_GENERAL_DEFAULT_ACCOUNTS,
          'buildDefaultAccountsModal', [data.accountsAdded]);
      } else {
        if (data.userLoggedIn) {
          that.displayModal(Text.DIV_GENERAL_DEFAULT_ACCOUNTS,
            'buildDefaultAccountsModal', []);
        }
      }
    }, function (error) {
      console.warn(error);
    });
  };

  /**
   * @description This function handles the removal of ledger table entry rows
   * that have been marked for deletion via the associated checkbox elements
   * constituting the first cell of each row. Pressing the appropriate sidebar
   * button automatically removes these highlighted entries from the table. Will
   * need to add back-end support that mirrors the removal of data from the
   * table, as with the above addition function.
   *
   * @returns {void}
   */
  inaccessible.handleRowRemoval = function () {

    // Declarations
    let checkedInputs, table, tableBody, target;

    if (this.scene === Scenes.DASHBOARD) {
      table = document.getElementById(Identifiers.ID_DASHBOARD_LEDGER_TABLE);
      tableBody = table.querySelector("tbody");
    } else {
      table = document.getElementById(Identifiers.ID_DOCUMENT_TABLE);
      tableBody = table;
    }

    checkedInputs = document.querySelectorAll("input[type='checkbox']:checked");

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
   * <code>accessible.init</code>. Ideally, it will dynamically generate HTML
   * via some internal helper functions and fade in on the scene via the use of
   * a <code>jQuery</code>-esque fade-in function.
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
      Utility.CHECK_OPACITY_RATE);
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
   * @description External getter for immutable <code>TableHeaders</code>
   *
   * @returns {enum} TableHeaders
   */
  accessible.getTableHeaders = function () {
    return inaccessible.extend({}, TableHeaders);
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
