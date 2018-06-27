/*
 * jquery-orgchart
 * git@github.com:wenchangshou2/jquery-orgchart.git
 *
 * Copyright (c) 2018 wcs
 * Licensed under the MIT license.
 */

(function($) {

  // Collection method.
  $.fn.jquery_orgchart = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.jquery_orgchart = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.jquery_orgchart.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.jquery_orgchart.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].jquery_orgchart = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
