import "../../vendor/css/magnific-popup.css";
import "../../vendor/js/magnific-popup.min.js";

(function ($) {
  "use strict";

  $(function () {
    $(".play-button").magnificPopup({
      type: "iframe",
      removalDelay: 300,
      mainClass: "mfp-fade",
    });

    $(".masonry__image").magnificPopup({
      type: "image",
      removalDelay: 300,
      mainClass: "mfp-fade",
      gallery: {
        enabled: true,
      },
    });
  });
})(jQuery);
