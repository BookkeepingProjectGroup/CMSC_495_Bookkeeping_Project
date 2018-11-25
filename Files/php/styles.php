<?php

  /**
   * This function is the primary concatenation and minification handler of the
   * PHP file in question, used to remove all unneeded comments, comment
   * symbols, and assorted indentation and whitespace characters as needed. Once
   * the styles have been minified and cleaned up, their contents are bolted on
   * to any previously minified contents to ensure that only one request for CSS
   * styles is made on page load rather than several depending on the number of
   * individual files present in the CSS directory folder. This will allow the
   * CSS engineers and specialists to divide CSS into encapsulating files as
   * needed without having to add a separate import to the HTML file each time.
   *
   * @author Andrew Eissen
   * @param buffer $outputBuffer The output buffer object
   * @return buffer $outputBuffer The modified output buffer object
   */
  function minifyStyles ($outputBuffer) {

    // Regex denoting text and comment symbols in styles
    $commentsRegex = '!/\*[^*]*\*+([^/][^*]*\*+)*/!';

    // Array of various spacing/indentation characters to remove
    $noncodeCharacters = array("\t", "\r", "\n", "\r\n", '  ', '    ');

    // Remove comments from styles
    $outputBuffer = preg_replace($commentsRegex, '', $outputBuffer);

    /* Remove tabs, spaces, and newlines */
    $outputBuffer = str_replace($noncodeCharacters, '', $outputBuffer);

    // Return modified buffer
    return $outputBuffer;
  }

  /**
   * This function is used to begin the concatenation/minification process. It
   * first marks the request as a <code>text/css</code> type via the appropriate
   * header, initializes a new output buffer object, then runs through the
   * argument parameter directory looking for wellformed files. Each of these is
   * included and handled by the parameter buffer handler function, which picks
   * over its style content and removes comments and assorted indentation and
   * spacing characters while concatenating its contents to any previous styles.
   * <br />
   * <br />
   * This function set is used simply to limit the number of HTTP requests for
   * CSS files required upon the loading of the DOM and the rendering of the
   * page. Additionally, the removal of comments and whitespace reduces the need
   * for an external minifier and associated <code>styles.min.css</code> build.
   *
   * @author Andrew Eissen
   * @param string $paramDirectory String representation of CSS directory
   * @param string $paramBaseFile String representation of base CSS file
   * @param string $paramHandler String representation of buffer handler
   * @return void
   */
  function init ($paramDirectory, $paramBaseFile, $paramHandler) {

    // Denote HTTP request header type
    header('Content-type: text/css');

    // Initialize output buffer
    ob_start($paramHandler);

    // Start with root/base file (may contain @imports and :root)
    include($paramDirectory . '/' . $paramBaseFile);

    // Iterate through directory and include remaining wellformed files
    foreach (new DirectoryIterator($paramDirectory) as $file) {
      if ($file->isFile() && $file->getFilename() !== $paramBaseFile) {
        include($file->getPathname());
      }
    }

    // Discard output buffer contents
    ob_end_flush();
  }

  // Begin the concatenation process
  init('../css', 'styles.css', 'minifyStyles');
?>
