import "jquery.marquee";

(function ($) {
  "use strict";

  $(function () {
    if ($(".marquee_mode").length) {
      $(".marquee_mode").marquee({
        speed: 100,
        gap: 0,
        delayBeforeStart: 0,
        direction: $("html").attr("dir") === "rtl" ? "right" : "left",
        duplicated: true,
        pauseOnHover: true,
        startVisible: true,
      });
    }
  });
})(jQuery);
