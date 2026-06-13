import "../../vendor/js/counter-up.min.js";
import "../../vendor/js/waypoint.min.js";

(function ($) {
  "use strict";

  $(function () {
    $(".counter").counterUp({
      delay: 16,
      time: 2000,
    });
  });
})(jQuery);
