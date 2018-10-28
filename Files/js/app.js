/**
 * @file app.js
 * @fileoverview The main module of the program, contains several access
 * namespaces denoting which functions, arrays, enums, and variables may be
 * returned for external or global usage. Begun 10/28/18
 * @author Andrew Eissen
 */
'use strict';

/**
 * @description The primary JavaScript module.
 *
 * @see {@link //google.github.io/styleguide/jsguide.html|Styleguide #1}
 * @see {@link //google.github.io/styleguide/javascriptguide.xml|Styleguide #2}
 * @author Andrew Eissen
 * @module BookkeepingProjectModule
 * @const
 */
const BookkeepingProjectModule = (function () {

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
   * @description This function serves as the main initialization function,
   * called on the completion of the DOM load by the externally-facing function
   * <code>accessible.init</code>. Ideally, it will dynamically generate HTML
   * via some internal helper functions and fade in on the scene via the use of
   * a <code>jQuery</code>-esque fade-in function.
   *
   * @returns {void}
   */
  inaccessible.main = function () {
    console.log('Testing');
    console.warn('Warning');
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
