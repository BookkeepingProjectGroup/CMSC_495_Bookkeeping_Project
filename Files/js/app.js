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
 * dashboard would be removed and the login scene rebuilt.
 * <br />
 * <br />
 * <pre>
 * Table of contents
 * - Script-globals             Line xxx
 * - Enums
 *   - Utility                  Line xxx
 *   - Identifiers              Line xxx
 *   - Text                     Line xxx
 *   - Operations               Line xxx
 *   - ModalButtons             Line xxx
 * - Data arrays
 *   - ledgerHeaders            Line xxx
 *   - sidebarButtonData        Line xxx
 *   - navlinksButtonData       Line xxx
 * - Function groups
 *   - Utility functions        Line xxx
 *   - Assembly functions       Line xxx
 *   - Builder functions        Line xxx
 *   - Display functions        Line xxx
 *   - Handler functions        Line xxx
 *   - Main function            Line xxx
 *   - Public functions         Line xxx
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
   * @description Enum for assorted utility constants. Herein are set assorted
   * default values of helper constants required in various contexts. These
   * values are included in an object-global private enum to assist in ease of
   * adjustment if a value needs to be changed universally for all elements or
   * functions making use of that value. Object is made immutable via
   * <code>Object.freeze</code>.
   *
   * @readonly
   * @enum {number}
   */
  inaccessible.Utility = Object.freeze({
    FADE_IN_INTERVAL: 10,
    OPACITY_INCREASE_AMOUNT: 0.015,
    SWIPE_PIXEL_VALUE: 1,
    SWIPE_DISTANCE_VALUE: 250,
    SWIPE_INTERVAL_TIME: 2000,
    CHECK_OPACITY_RATE: 500,
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
   */
  inaccessible.Identifiers = Object.freeze({

    // Login page
    ID_LOGIN_CONTAINER: 'login-container',
    ID_LOGIN_TOPBAR: 'login-topbar',
    ID_LOGIN_MAIN: 'login-main',
    ID_LOGIN_MAIN_HEADER: 'login-main-header',
    ID_LOGIN_MAIN_INPUT_HOLDER: 'login-main-input-holder',
    ID_LOGIN_MAIN_INPUT_USERNAME: 'login-main-input-username',
    ID_LOGIN_MAIN_INPUT_PASSWORD: 'login-main-input-password',
    ID_LOGIN_FOOTER: 'login-footer',
    ID_LOGIN_FOOTER_BUTTONS_HOLDER: 'login-footer-buttons-holder',
    ID_LOGIN_FOOTER_BUTTONS_CREATE: 'login-footer-buttons-create',
    ID_LOGIN_FOOTER_BUTTONS_SUBMIT: 'login-footer-buttons-submit',

    // Main application dashboard
    ID_DASHBOARD_CONTAINER: 'dashboard-container',
    ID_DASHBOARD_NAVIGATION: 'dashboard-navigation',
    ID_DASHBOARD_TOPBAR: 'dashboard-topbar',
    ID_DASHBOARD_TOPBAR_META: 'dashboard-topbar-meta',
    ID_DASHBOARD_TOPBAR_META_TITLE: 'dashboard-topbar-meta-title',
    ID_DASHBOARD_TOPBAR_META_SUBTITLE: 'dashboard-topbar-meta-subtitle',
    ID_DASHBOARD_TOPBAR_NAVLINKS: 'dashboard-topbar-navlinks',
    ID_DASHBOARD_TOPBAR_NAVLINKS_HOLDER: 'dashboard-topbar-navlinks-holder',
    ID_DASHBOARD_TOPBAR_NAVLINKS_ACCOUNT: 'dashboard-topbar-navlinks-account',
    ID_DASHBOARD_TOPBAR_NAVLINKS_PRINT: 'dashboard-topbar-navlinks-print',
    ID_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT: 'dashboard-topbar-navlinks-logout',
    ID_DASHBOARD_SECTION: 'dashboard-section',
    ID_DASHBOARD_SIDEBAR: 'dashboard-sidebar',
    ID_DASHBOARD_SIDEBAR_BUTTONS: 'dashboard-sidebar-buttons',
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
    ID_MODAL_STATUS_DIV: 'modal-status',

    // Change password modal
    ID_CHANGEP_CONTAINER: 'modal-changepassword-container',
    ID_CHANGEP_INFORMATION: 'modal-changepassword-information',
    ID_CHANGEP_FORM: 'modal-changepassword-form',
    ID_CHANGEP_INPUT_PASSWORD: 'modal-changepassword-input-password',
    ID_CHANGEP_INPUT_REENTER: 'modal-changepassword-input-reenter',

    // General purpose ids that show up on multiple modules
    ID_GENERAL_BODY: 'application-body',
    ID_GENERAL_TOPBAR_META_HOLDER: 'general-topbar-meta-holder',
    ID_GENERAL_TOPBAR_META_TITLE: 'general-topbar-meta-title',
    ID_GENERAL_TOPBAR_META_SUBTITLE: 'general-topbar-meta-subtitle',

    // Assorted login scene classes
    CLASS_LOGIN_GENERAL_EXTRA_PADDING: 'login-general-title-extra-padding',
    CLASS_LOGIN_MAIN_INPUT_TEXTBOX: 'login-main-input-textbox',

    // Dashboard classes
    CLASS_DASHBOARD_SIDEBAR_BUTTONS_HOLDER: 'dashboard-sidebar-buttons-holder',
    CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT: 'dashboard-sidebar-buttons-item',
    CLASS_DASHBOARD_LEDGER_TABLE_HEADER: 'dashboard-ledger-table-header',
    CLASS_DASHBOARD_LEDGER_TABLE_CHECKBOX: 'dashboard-ledger-table-checkbox',

    // Modal classes
    CLASS_MODAL_MAJOR_SECTION: 'modal-major-section',
    CLASS_MODAL_BUTTON: 'modal-footer-buttons-button',
    CLASS_MODAL_SECTION_TEXTBOX: 'modal-section-textbox',
    CLASS_MODAL_ACTION_SUCCESS: 'modal-action-success',
    CLASS_MODAL_ACTION_FAILURE: 'modal-action-failure',

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
    CLASS_GENERAL_BUTTONS_HOLDER: 'general-buttons-holder',
  });

  /**
   * @description This enum is used to store all the text <code>String</code>s
   * used in the display of popup <code>window.alert</code>s or error messages
   * to be appended to the main container element, as well as the text nodes of
   * button or checkbox label elements.
   *
   * @readonly
   * @enum {string}
   */
  inaccessible.Text = Object.freeze({
    INPUT_LOGIN_MAIN_USERNAME_PLACEHOLDER: 'Username',
    INPUT_LOGIN_MAIN_PASSWORD_PLACEHOLDER: 'Password',
    INPUT_CHANGEP_PASSWORD_PLACEHOLDER: 'Enter new password',
    INPUT_CHANGEP_REENTER_PLACEHOLDER: 'Confirm password',
    BUTTON_LOGIN_FOOTER_CREATE: 'Create',
    BUTTON_LOGIN_FOOTER_SUBMIT: 'Login',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_ACCOUNT: 'Account',
    BUTTON_DASHBOARD_TOPBAR_PRINT: 'Print ledger',
    BUTTON_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT: 'Logout',
    DIV_LOGIN_MAIN_HEADER: 'Login or create account',
    DIV_DASHBOARD_TOPBAR_NAVLINKS_WELCOME: 'Welcome user!',
    DIV_GENERAL_TOPBAR_TITLE: 'Keep Dem Books Y\'all', // Need some title
    DIV_GENERAL_TOPBAR_SUBTITLE: 'A bookkeeping application for CMSC 495',
    DIV_CHANGEP_INFORMATION: 'Please note that password entries must match',
    ERROR_NETWORK: 'A network error has been encountered',
    ERROR_ILLEGITIMATE_INPUT: 'Password content must be alphanumeric',
    ERROR_MISMATCHING_PASSWORDS: 'Passwords do not match',
    ERROR_FAILED_PASSWORD_RESET: 'Password reset unsuccessful',
    SUCCESS_PASSWORD_RESET: 'Password successfully reset',
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
   */
  inaccessible.Operations = Object.freeze({

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
   */
  inaccessible.ModalButtons = Object.freeze({
    CLOSE: {
      buttonType: 'Close',
      functionName: 'handleModalClose',
      functionArguments: [],
      requiresWrapper: false,
      elementId: 'modal-footer-buttons-close',
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_BIG_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
        inaccessible.Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
    CLEAR: {
      buttonType: 'Clear',
      functionName: 'handleModalFormClear',
      functionArguments: [],
      requiresWrapper: false,
      elementId: 'modal-footer-buttons-clear',
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_BIG_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
        inaccessible.Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
    SUBMIT: {
      buttonType: 'Submit',
      functionName: 'handleModalFormSubmit',
      functionArguments: [],
      requiresWrapper: false,
      elementId: 'modal-footer-buttons-submit',
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_BIG_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
        inaccessible.Identifiers.CLASS_MODAL_BUTTON,
      ],
    },
  });

  // Data arrays

  /**
   * @description This array contains the <code>String</code> representations of
   * each of the table columns present in the ledger. This array will not be
   * retained in the production build of the project, but under present
   * circumstances, its use is required to faciliate the addition of headers
   * until the author can think of a better way of doing this.
   */
  inaccessible.ledgerHeaders = [
    "delete",     // Checkbox for deletion
    "number",     // Account number
    "account",    // Account name
    "debit",      // Debit
    "credit",     // Credit
    "memo",       // Description of transaction
    "name",       // Individual in question
    "date",       // Recorded date
  ];

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
      buttonType: 'Change password',
      functionName: 'displayPasswordChangeModal',
      functionArguments: [],
      requiresWrapper: true,
      elementId: 'sidebar-buttons-element-change-password',
      elementClasses: [
        inaccessible.Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        inaccessible.Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: 'Add new document',
      functionName: 'handleDocumentAddition',
      functionArguments: [],
      requiresWrapper: true,
      elementId: 'sidebar-buttons-element-newdoc',
      elementClasses: [
        inaccessible.Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        inaccessible.Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: 'Add new customer',
      functionName: 'handleCustomerAddition',
      functionArguments: [],
      requiresWrapper: true,
      elementId: 'sidebar-buttons-element-newCustomer',
      elementClasses: [
        inaccessible.Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        inaccessible.Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: 'Add new vendor',
      functionName: 'handleVendorAddition',
      functionArguments: [],
      requiresWrapper: true,
      elementId: 'sidebar-buttons-element-newVendor',
      elementClasses: [
        inaccessible.Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        inaccessible.Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: 'Delete ledger entry',
      functionName: 'handleRowRemoval',
      functionArguments: [],
      requiresWrapper: true,
      elementId: 'sidebar-buttons-element-delete',
      elementClasses: [
        inaccessible.Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        inaccessible.Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: 'Test - Add JSON row',
      functionName: 'handleTestGetRequest',
      functionArguments: [],
      requiresWrapper: true,
      elementId: 'sidebar-buttons-element-test1',
      elementClasses: [
        inaccessible.Identifiers.CLASS_DASHBOARD_SIDEBAR_BUTTONS_ELEMENT,
        inaccessible.Identifiers.CLASS_GENERAL_ACTION_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
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
      buttonType: inaccessible.Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_ACCOUNT,
      functionName: 'handleAccountDetailsDisplay',
      functionArguments: [],
      requiresWrapper: false,
      elementId: inaccessible.Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_ACCOUNT,
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_LINK_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: inaccessible.Text.BUTTON_DASHBOARD_TOPBAR_PRINT,
      functionName: 'handlePagePrinting',
      functionArguments: [],
      requiresWrapper: false,
      elementId: inaccessible.Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_PRINT,
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_LINK_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
      ],
    },
    {
      buttonType: inaccessible.Text.BUTTON_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT,
      functionName: 'handleLogout',
      functionArguments: [],
      requiresWrapper: false,
      elementId: inaccessible.Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_LOGOUT,
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_LINK_BUTTON,
        inaccessible.Identifiers.CLASS_GENERAL_OPENSANS,
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
    let that, request;

    // Preserve scope context
    that = this;

    return new Promise(function (resolve, reject) {

      // Definitions
      request = new XMLHttpRequest();
      request.open(paramType, paramUrl);

      if (paramType === 'POST' && paramData != null) {

        /* JSON implementation
         * request.setRequestHeader('Content-Type', 'application/json');
         * paramData = JSON.stringify(paramData);
         */

        // Query string implementation
        request.setRequestHeader('Content-Type',
          'application/x-www-form-urlencoded');
        paramData = that.serialize(paramData);
      }

      request.onload = function () {
        console.warn(request.responseText);
        if (request.status == 200) {
          resolve(request.response);
        } else {
          reject(Error(request.statusText));
        }
      };

      // Handle network errors
      request.onerror = function () {
        reject(Error(inaccessible.Text.ERROR_NETWORK));
      };

      // Make request (data will be either null or a stringified object)
      request.send(paramData);
    });
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
   * <code>inaccessible.Operations.ADDITION</code> and
   * <code>inaccessible.Operations.SUBTRACTION</code> operations; the
   * comparison operations in the enum require a different invocation method.
   *
   * @param {!Array<number>} paramList Array of number values
   * @param {string} paramOperation The <code>Operations</code> enum operation
   * @returns {number}
   */
  inaccessible.performCommonOperation = function (paramList, paramOperation) {
    return paramList.reduce(this.Operations[paramOperation]);
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
    return /^[a-z0-9]+$/i.test(paramInput);
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
  inaccessible.extend = function(paramTarget, paramObject) {
    return {...paramTarget, ...paramObject};
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
        that.Operations[fadeTypeObject.comparison](
          container.style.opacity,
          fadeTypeObject.comparisonValue
        )
      ) {

        // Either opacity + const_value or opacity - const_value
        container.style.opacity = that.performCommonOperation(
          [
            Number.parseFloat(container.style.opacity),
            that.Utility.OPACITY_INCREASE_AMOUNT
          ],
          fadeTypeObject.operator
        );
      } else {
        if (DEBUG) {
          console.log('Fading complete');
        }

        clearInterval(interval);
        return;
      }
    }, this.Utility.FADE_IN_INTERVAL);
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
    let that, container, interval, startTime, timePassed;

    // Preserve scope
    that = this;

    // Cache start time
    startTime = Date.now();

    // Set container placement to relative
    container = document.getElementById(paramElementId);
    container.style.position= 'relative';

    // Define interval
    interval = setInterval(function () {

      // Check time since start
      timePassed = Date.now() - startTime;

      if (timePassed >= that.Utility.SWIPE_INTERVAL_TIME) {
        if (DEBUG) {
          console.log('Swiping complete');
        }

        clearInterval(interval);
        return;
      }

      // Draw animation at the moment of timePassed
      container.style.left = timePassed / 5 + 'px';

    }, this.Utility.FADE_IN_INTERVAL);
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
   * @param {string} paramElementId Present container id
   * @param {string} paramBuilderFunctionName Builder name
   * @param {string} paramOpacityElementId Future container id
   * @returns {boolean}
   */
  inaccessible.tinderize = function (paramElementId,
      paramBuilderFunctionName, paramOpacityElementId) {

    // Declaration
    let that, interval, container;

    // Definitions
    that = this;
    container = document.getElementById(paramElementId);

    // Move scene to the right and fade out prior to removing children from DOM
    this.swipeRight(paramElementId);
    this.fade('out', paramElementId);

    // Maybe reconfigure using a promise as per the api method above?
    interval = setInterval(function () {
      if (container.style.opacity == 0) {
        clearInterval(interval);

        // Remove outdated DOM elements
        that.emptyElementOfContent(that.Identifiers.ID_GENERAL_BODY);

        // Build new page and fade in on the scene
        document.body.appendChild(that[paramBuilderFunctionName]());
        that.fade('in', paramOpacityElementId);
        return true;
      }
    }, this.Utility.CHECK_OPACITY_RATE);
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
   *   elementId: 'inaccessible.Identifiers.ID_FOO',
   *   elementClasses: [
   *     inaccessible.Identifiers.CLASS_FOO_1,
   *     inaccessible.Identifiers.CLASS_FOO_2,
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
        class: this.Identifiers.CLASS_GENERAL_BUTTONS_HOLDER,
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
   * @param {object} paramConfig Config object for the <code>table</code> itself
   * @returns {HTMLElement} ledger The formed ledger DOM element
   */
  inaccessible.assembleLedger = function (paramConfig) {

    // Declaration
    let ledger, newRow, newCell, configRowHeader;

    configRowHeader = {
      class: this.Identifiers.CLASS_DASHBOARD_LEDGER_TABLE_HEADER,
    };

    // Create ledger table
    ledger = this.assembleElement(['table', paramConfig]);

    // New first row
    newRow = ledger.insertRow(0);

    for (let i = 0; i < this.ledgerHeaders.length; i++ ) {
      newCell = newRow.insertCell(i);
      newCell.appendChild(
        this.assembleElement(['th', configRowHeader, this.ledgerHeaders[i]])
      );
    }

    return ledger;
  };

  // Builder functions

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
   * This particular builder is responsible for constructing the login page
   * scene, viewable on app load or account logout.
   *
   * @returns {HTMLElement} The constructed page scene
   */
  inaccessible.buildLoginInterface = function () {

    // Declarations
    let configContainer, configTopbar, configTopbarHolder, configTopbarTitle,
      configTopbarSubtitle, configMain, configMainHeader, configMainLoginHolder,
      configMainLoginUsername, configMainLoginPassword, configFooter,
      configButtonsHolder, configButtonsCreate, configButtonsSubmit;

    configContainer = {
      id: this.Identifiers.ID_LOGIN_CONTAINER,
      class: this.Identifiers.CLASS_GENERAL_MAJOR_SECTION + ' ' +
        this.Identifiers.CLASS_GENERAL_CONTAINER,
      style: 'opacity: 0',
    };

    configTopbar = {
      id: this.Identifiers.ID_LOGIN_TOPBAR,
      class: this.Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configTopbarHolder = {
      id: this.Identifiers.ID_GENERAL_TOPBAR_META_HOLDER,
      class: this.Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING,
    };

    configTopbarTitle = {
      id: this.Identifiers.ID_GENERAL_TOPBAR_META_TITLE,
      class: this.Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    configTopbarSubtitle = {
      id: this.Identifiers.ID_GENERAL_TOPBAR_META_SUBTITLE,
      class: this.Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configMain = {
      id: this.Identifiers.ID_LOGIN_MAIN,
    };

    configMainHeader = {
      id: this.Identifiers.ID_LOGIN_MAIN_HEADER,
      class: this.Identifiers.CLASS_LOGIN_GENERAL_EXTRA_PADDING + ' ' +
        this.Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configMainLoginHolder = {
      id: this.Identifiers.ID_LOGIN_MAIN_INPUT_HOLDER,
    };

    configMainLoginUsername = {
      id: this.Identifiers.ID_LOGIN_MAIN_INPUT_USERNAME,
      class: this.Identifiers.CLASS_LOGIN_MAIN_INPUT_TEXTBOX,
      placeholder: this.Text.INPUT_LOGIN_MAIN_USERNAME_PLACEHOLDER,
      type: 'text',
    };

    configMainLoginPassword = {
      id: this.Identifiers.ID_LOGIN_MAIN_INPUT_PASSWORD,
      class: this.Identifiers.CLASS_LOGIN_MAIN_INPUT_TEXTBOX,
      placeholder: this.Text.INPUT_LOGIN_MAIN_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    configFooter = {
      id: this.Identifiers.ID_LOGIN_FOOTER,
    };

    configButtonsHolder = {
      id: this.Identifiers.ID_LOGIN_FOOTER_BUTTONS_HOLDER,
      class: this.Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

    configButtonsCreate = {
      buttonType: this.Text.BUTTON_LOGIN_FOOTER_CREATE,
      functionName: 'handleAccountCreation',
      functionArguments: [],
      requiresWrapper: false,
      elementId: this.Identifiers.ID_LOGIN_FOOTER_BUTTONS_CREATE,
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    };

    configButtonsSubmit = {
      buttonType: this.Text.BUTTON_LOGIN_FOOTER_SUBMIT,
      functionName: 'handleLogin',
      functionArguments: [],
      requiresWrapper: false,
      elementId: this.Identifiers.ID_LOGIN_FOOTER_BUTTONS_SUBMIT,
      elementClasses: [
        inaccessible.Identifiers.CLASS_GENERAL_BIG_BUTTON,
      ],
    };

    return this.assembleElement(
      ['div', configContainer,
        ['header', configTopbar,
          ['div', configTopbarHolder,
            ['div', configTopbarTitle,
              this.Text.DIV_GENERAL_TOPBAR_TITLE,
            ],
            ['div', configTopbarSubtitle,
              this.Text.DIV_GENERAL_TOPBAR_SUBTITLE,
            ],
          ],
        ],
        ['main', configMain,
          ['div', configMainHeader,
            this.Text.DIV_LOGIN_MAIN_HEADER,
          ],
          ['form', configMainLoginHolder,
            ['input', configMainLoginUsername],
            ['input', configMainLoginPassword],
          ]
        ],
        ['footer', configFooter,
          ['div', configButtonsHolder,
            this.assembleButtonElement(configButtonsCreate),
            this.assembleButtonElement(configButtonsSubmit),
          ],
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
      configSidebarButtonContainer, configLedger, configLedgerTable, that;

    // Preserve scope
    that = this;

    configContainer = {
      id: this.Identifiers.ID_DASHBOARD_CONTAINER,
      class: this.Identifiers.CLASS_GENERAL_MAJOR_SECTION + ' ' +
        this.Identifiers.CLASS_GENERAL_CONTAINER,
      style: 'opacity: 0',
    };

    configTopbar = {
      id: this.Identifiers.ID_DASHBOARD_TOPBAR,
      class: this.Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configTopbarMeta = {
      id: this.Identifiers.ID_DASHBOARD_TOPBAR_META,
      class: this.Identifiers.CLASS_GENERAL_TOPBAR_DIV,
    };

    configTopbarMetaTitle = {
      id: this.Identifiers.ID_GENERAL_TOPBAR_META_TITLE,
      class: this.Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    configTopbarMetaSubtitle = {
      id: this.Identifiers.ID_GENERAL_TOPBAR_META_SUBTITLE,
      class: this.Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configTopbarNavLinks = {
      id: this.Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS,
      class: this.Identifiers.CLASS_GENERAL_TOPBAR_DIV,
    };

    configTopbarNavLinksHolder = {
      id: this.Identifiers.ID_DASHBOARD_TOPBAR_NAVLINKS_HOLDER
    };

    configSection = {
      id: this.Identifiers.ID_DASHBOARD_SECTION,
      class: this.Identifiers.CLASS_GENERAL_FLEX_JUSTIFY,
    };

    configSidebar = {
      id: this.Identifiers.ID_DASHBOARD_SIDEBAR,
      class: this.Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configSidebarButtonContainer = {
      id: this.Identifiers.ID_DASHBOARD_SIDEBAR_BUTTONS,
    };

    configLedger = {
      id: this.Identifiers.ID_DASHBOARD_LEDGER,
      class: this.Identifiers.CLASS_GENERAL_MAJOR_SECTION,
    };

    configLedgerTable = {
      id: this.Identifiers.ID_DASHBOARD_LEDGER_TABLE,
      style: 'table-layout: fixed;',
    };

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['header', configTopbar,
          ['div', configTopbarMeta,
            ['div', configTopbarMetaTitle,
              this.Text.DIV_GENERAL_TOPBAR_TITLE,
            ],
            ['div', configTopbarMetaSubtitle,
              this.Text.DIV_GENERAL_TOPBAR_SUBTITLE,
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
              this.assembleLedger(configLedgerTable),
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
    let that, builtButtons, button, configBlackout, configModal, configHeader,
      configHeaderTitle, configSection, configFooter, configFooterButtons;

    // Preserve scope
    that = this;

    // Opaque black background commanding focus on modal
    configBlackout = {
      id: this.Identifiers.ID_MODAL_BLACKOUT,
    };

    // Module div
    configModal = {
      id: this.Identifiers.ID_MODAL_MAIN,
    };

    // Title and nothing else
    configHeader = {
      id: this.Identifiers.ID_MODAL_HEADER,
      class: this.Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Span wrapper for title text
    configHeaderTitle = {
      id: this.Identifiers.ID_MODAL_HEADER_TITLE,
      class: this.Identifiers.CLASS_GENERAL_MONTSERRAT,
    };

    // Empty main section to which other builds will be appended
    configSection = {
      id: this.Identifiers.ID_MODAL_SECTION,
      class: this.Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Section for buttons
    configFooter = {
      id: this.Identifiers.ID_MODAL_FOOTER,
      class: this.Identifiers.CLASS_MODAL_MAJOR_SECTION,
    };

    // Container for the footer buttons
    configFooterButtons = {
      id: this.Identifiers.ID_MODAL_FOOTER_BUTTONS,
    };

    // Build holder
    builtButtons= this.assembleElement('div', configFooterButtons);

    // Build button config into actual buttons
    paramButtons.forEach(function (buttonObject) {

      // Build new button HTMLElement
      button = that.assembleButtonElement(buttonObject);

      // Push completed button to the array in question
      builtButtons.appendChild(button);
    });

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
            builtButtons,
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
      id: this.Identifiers.ID_CHANGEP_CONTAINER,
    };

    configInformation = {
      id: this.Identifiers.ID_CHANGEP_INFORMATION,
      class: this.Identifiers.CLASS_GENERAL_OPENSANS,
    };

    configInputForm = {
      id: this.Identifiers.ID_CHANGEP_FORM,
    };

    configInputPassword = {
      id: this.Identifiers.ID_CHANGEP_INPUT_PASSWORD,
      class: this.Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: this.Text.INPUT_CHANGEP_PASSWORD_PLACEHOLDER,
      type: 'password',
    };

    configInputPasswordReentered = {
      id: this.Identifiers.ID_CHANGEP_INPUT_REENTER,
      class: this.Identifiers.CLASS_MODAL_SECTION_TEXTBOX,
      placeholder: this.Text.INPUT_CHANGEP_REENTER_PLACEHOLDER,
      type: 'password',
    };

    // Return assembled interface
    return this.assembleElement(
      ['div', configContainer,
        ['div', configInformation,
          this.Text.DIV_CHANGEP_INFORMATION,
        ],
        ['form', configInputForm,
          ['input', configInputPassword],
          ['input', configInputPasswordReentered],
        ],
      ],
    );
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
   * than returning it from the function. This particular display function is
   * used to create and add the mini-scene contained in the modal framework
   * related to the password changing functionality. It shows a pair of input
   * textfields and a set of three buttons allowing the user to clear the modal
   * of old input and any error notices, submit new data, or exit the modal
   * window. Its associated handler responsible for vetting input is
   * <code>inaccessible.handlePasswordChange</code>.
   *
   * @returns {void}
   */
  inaccessible.displayPasswordChangeModal = function () {

    // Declarations
    let innerContent, submitButtonCopy, buttons;

    // Inner modal mini-scene
    innerContent = this.buildPasswordChangeModal();

    // Make shallow copy of default submit button config
    submitButtonCopy = this.extend({}, this.ModalButtons.SUBMIT);

    // Adjust handler function String representation
    submitButtonCopy.functionName = 'handlePasswordChange';

    // Buttons for the modal footer
    buttons = [
      submitButtonCopy,         // Submit (custom)
      this.ModalButtons.CLEAR,  // Clear fields
      this.ModalButtons.CLOSE,  // Close modal
    ];

    // Build and add the modal to the body at the bottom
    document.body.appendChild(
      this.buildModal('Change password', innerContent, buttons));
  };

  /**
   * @description This builder function is used to construct a new <div> element
   * indicating to the user that the operation undertaken in the modal (be that
   * password submission or the like) has either failed or succeeded. This
   * approach was inspired by the UMUC LEO login module, which displays an error
   * div like this on an incorrect login.
   *
   * @param {boolean} paramIsSuccess
   * @param {string} paramMessage
   * @return {void}
   */
  inaccessible.displayStatusNotice = function (paramIsSuccess, paramMessage) {

    // Declaration
    let configStatusDiv, status, aliasIds, statusDiv, extantStatusDiv;

    // Choose class name fragment based on success of action
    status = (paramIsSuccess) ? 'SUCCESS' : 'FAILURE';

    // Can alias enums only
    aliasIds = this.Identifiers;

    configStatusDiv = {
      id: aliasIds.ID_MODAL_STATUS_DIV,
      class: aliasIds.CLASS_GENERAL_OPENSANS + ' ' +
        aliasIds[`CLASS_MODAL_ACTION_${status}`]
    };

    // Duild the <biv>
    statusDiv = this.assembleElement(['div', configStatusDiv, paramMessage]);

    // Determine whether or not there is already a status message in the modal
    extantStatusDiv = document.getElementById(aliasIds.ID_MODAL_STATUS_DIV);

    // Remove it if it does exist
    if (extantStatusDiv) {
      extantStatusDiv.remove();
    }

    // Add the bottom of modal body and above buttons
    this.append(this.Identifiers.ID_MODAL_SECTION, statusDiv);
  };

  // Handler functions

  /**
   * @description Handler for presses of the new document creation button on the
   * lefthand sidebar.
   *
   * @returns {void}
   */
  inaccessible.handleDocumentAddition = function () {
    window.alert('Add a new document');
  };

  /**
   * @description This handler is responsible for allowing for the addition of
   * new customers, with the fields "name" and "address" serving as parameters
   * to be returned to the appropriate endpoint.
   *
   * @returns {void}
   */
  inaccessible.handleCustomerAddition = function () {

    // Declarations
    let name, address;

    // Test definitions
    name = "Mr. Customer";
    address = "1616 McCormick Dr, Largo, MD 20774";

    this.sendRequest('POST', 'php/add_customer.php', {
      name: name,
      address: address,
    }).then(function (response) {
      console.log(response);
    }, function (error) {
      console.error(error);
    });
  };

  /**
   * @description This handler is just a test handler attached to a number of
   * the space-filling buttons contained on the lefthand sidebar. It calls the
   * main <code>inaccessible.api.get</code> function used to make GET requests
   * and simply loads some test <code>json</code> data for now.
   *
   * @returns {void}
   */
  inaccessible.handleTestGetRequest = function () {

    // Declaration
    let that, returnedData;

    // Preserve scope
    that = this;

    this.sendRequest('GET', 'json/testData.json').then(function (response) {

      // Parse JSON for use in loop
      returnedData = JSON.parse(response);

      for (let i = 0; i < returnedData.data.length; i++) {
        that.handleRowAddition(returnedData.data[i]);
      }
    }, function (error) {
      console.error(error);
    });
  };

  /**
   * @description Handler for presses of the "Create" button option login modal
   * page. It may be used to load a new, similar scene that has more fields
   * related to account creation info.
   *
   * @returns {void}
   */
  inaccessible.handleAccountCreation = function () {
    window.alert('Insert account creation here');
  };

  /**
   * @description This handler function is invoked once the user has pressed the
   * "Login" button in the login modal scene. It grabs the values inputted by
   * the user in the input textboxes and calls
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
    let that, username, password, aliasIds, data;

    // Preserve scope context
    that = this;

    // Can alias enums only
    aliasIds = this.Identifiers;

    // Get user input field values
    username =
      document.getElementById(aliasIds.ID_LOGIN_MAIN_INPUT_USERNAME).value;
    password =
      document.getElementById(aliasIds.ID_LOGIN_MAIN_INPUT_PASSWORD).value;

    // Alphanumeric data only for username and password
    if (!this.isLegalInput(username) || !this.isLegalInput(password)) {
      window.alert(this.Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    this.sendRequest('POST', 'php/login.php', {
      username: username,
      password: password,
    }).then(function (response) {

      // Parse JSON into object
      data = JSON.parse(response);
      console.log(data);

      if (data.isLogonSuccessful) {
        console.log('TINDERIZE HERE');

        /* UNCOMMENT ONCE ACCOUNT CREATION IS ENABLED
        // Fade out and remove content prior to rebuilding of main interface
        that.tinderize(that.Identifiers.ID_LOGIN_CONTAINER,
          'buildUserInterface', that.Identifiers.ID_DASHBOARD_CONTAINER);
        */
      } else {
        console.warn('DISPLAY ERROR MESSAGE IN SCENE');
        return;
      }
    }, function (error) {
      console.error(error);
    });

    // Fade out and remove content prior to rebuilding of main interface
    this.tinderize(this.Identifiers.ID_LOGIN_CONTAINER, 'buildUserInterface',
      this.Identifiers.ID_DASHBOARD_CONTAINER);
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
    this.tinderize(this.Identifiers.ID_DASHBOARD_CONTAINER,
      'buildLoginInterface', this.Identifiers.ID_LOGIN_CONTAINER);
  };

  /**
   * @description Handler for presses of the "Account" button option in the
   * upper-right toolbar.
   *
   * @returns {void}
   */
  inaccessible.handleAccountDetailsDisplay = function () {
    window.alert('Insert account details in some form');
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
    modal = document.getElementById(this.Identifiers.ID_MODAL_BLACKOUT);

    // Remove
    modal.parentNode.removeChild(modal);
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
    let textboxes, aliasIds, statusNotice;

    // Can alias enums
    aliasIds = this.Identifiers;

    // Grab the input textboxes in the main modal section body
    textboxes = document
      .getElementById(aliasIds.ID_MODAL_SECTION)
      .getElementsByClassName(aliasIds.CLASS_MODAL_SECTION_TEXTBOX);

    // Grab any extant success/failure action notice
    statusNotice = document.getElementById(aliasIds.ID_MODAL_STATUS_DIV);

    // Remove if present
    if (statusNotice) {
      statusNotice.remove();
    }

    // Set each input value as an empty string
    Array.prototype.forEach.call(textboxes, function (textbox) {
      textbox.value = '';
    });
  };

  /**
   * @description This handler is used to handle the submission of user data on
   * the press of the "Submit" button. This is the default handler present in
   * the <code>inaccessible.ModalButtons</code> enum and may be overridden by
   * implementing functions that shallow copy the appropriate button config
   * object and adjust the <code>functionName</code> handler string.
   *
   * @returns {void}
   */
  inaccessible.handleModalFormSubmit = function () {
    window.alert('Submit data!');
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
    let that, password, passwordReenter, aliasIds, data;

    // Preserve scope
    that = this;

    // Can alias enums only
    aliasIds = this.Identifiers;

    // Get user input field values
    password =
      document.getElementById(aliasIds.ID_CHANGEP_INPUT_PASSWORD).value;
    passwordReenter =
      document.getElementById(aliasIds.ID_CHANGEP_INPUT_REENTER).value;

    // Alphanumeric data only for passwords
    if (!this.isLegalInput(password) || !this.isLegalInput(passwordReenter)) {
      this.displayStatusNotice(false, this.Text.ERROR_ILLEGITIMATE_INPUT);
      return;
    }

    // Passwords must match
    if (password !== passwordReenter) {
      this.displayStatusNotice(false, this.Text.ERROR_MISMATCHING_PASSWORDS);
      return;
    }

    // Send POST request
    this.sendRequest('POST', 'php/set_password.php', {
      password: passwordReenter,
    }).then(function (response) {

      // Parse the JSON response into a usable object
      data = JSON.parse(response);

      // Check server response data for successful password reset
      if (data.isPasswordSetSuccessful) {
        that.displayStatusNotice(true, that.Text.SUCCESS_PASSWORD_RESET);
      } else {
        that.displayStatusNotice(false, that.Text.ERROR_FAILED_PASSWORD_RESET);
      }
    }, function (error) {
      console.warn(error);
      that.displayStatusNotice(false, that.Text.ERROR_NETWORK);
    });
  };

  /**
   * @description This handler is used to deal with the insertion of new rows to
   * the main ledger table. It could use some work, but when provided an object
   * with the required properties (presumably originating from a related
   * <code>JSON</code> file), it will produce a new line and append it to the
   * present table listing. Required: Addition of relevant back-end code to
   * handle addition of user data in some form.
   *
   * @param {object} paramRowObject
   * @returns {void}
   */
  inaccessible.handleRowAddition = function (paramRowObject) {

    // Declaration
    let table, rowCount, newRow, newCell, valuesArray, configCheckbox;

    // For storage of values associated with object property keys
    valuesArray = [];

    // The ledger itself
    table = document.getElementById(this.Identifiers.ID_DASHBOARD_LEDGER_TABLE);

    // Number of current rows, used to figure out where to put the new one
    rowCount = table.rows.length;

    // Insert a new row
    newRow = table.insertRow(rowCount);

    // This is a messy step assuming the row data is in object & not array form
    for (let key in paramRowObject) {
      valuesArray.push(paramRowObject[key]);
    }

    // Individual config for this checkbox
    configCheckbox = {
      type: 'checkbox',
      class: this.Identifiers.CLASS_DASHBOARD_LEDGER_TABLE_CHECKBOX,
    };

    for (let i = 0; i < this.ledgerHeaders.length; i++) {

      // First cell should be a deletion checkbox
      if (i == 0) {
        newCell = newRow.insertCell(i);
        newCell.appendChild(this.assembleElement(['input', configCheckbox]));
      } else {
        newCell = newRow.insertCell(i);
        newCell.appendChild(document.createTextNode(valuesArray[i - 1]));
      }
    }
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
    let checkedInputs, table, tbody;

    // Definitions
    table = document.getElementById(this.Identifiers.ID_DASHBOARD_LEDGER_TABLE);
    tbody = table.querySelector("tbody");
    checkedInputs = document.querySelectorAll("input[type='checkbox']:checked");

    Array.prototype.slice.call(checkedInputs).forEach(input =>
      tbody.removeChild(input.parentNode.parentNode)
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
    let userInterface;

    // Apply body identifier
    document.body.setAttribute('id', this.Identifiers.ID_GENERAL_BODY);

    // Assemble the user interface dynamically
    userInterface = this.buildLoginInterface();

    // Populate DOM body with assembled interface
    document.body.appendChild(userInterface);

    // Fade in on the scene
    this.fade('in', this.Identifiers.ID_LOGIN_CONTAINER);
  };

  // Public functions

  /**
   * @description External getter for immutable <code>Utility</code>
   *
   * @returns {enum} inaccessible.Utility
   */
  accessible.getUtility = function () {
    return inaccessible.Utility;
  };

  /**
   * @description External getter for immutable <code>Identifiers</code>
   *
   * @returns {enum} inaccessible.Identifiers
   */
  accessible.getIdentifiers = function () {
    return inaccessible.Identifiers;
  };

  /**
   * @description External getter for immutable <code>Text</code>
   *
   * @returns {enum} inaccessible.Text
   */
  accessible.getText = function () {
    return inaccessible.Text;
  };

  /**
   * @description External getter for immutable <code>Operations</code>
   *
   * @returns {enum} inaccessible.Operations
   */
  accessible.getOperations = function () {
    return inaccessible.Operations;
  };

  /**
   * @description External getter for immutable <code>ModalButtons</code>
   *
   * @returns {enum} inaccessible.ModalButtons
   */
  accessible.getModalButtons = function () {
    return inaccessible.ModalButtons;
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
