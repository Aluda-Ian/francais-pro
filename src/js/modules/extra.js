(function ($) {
  "use strict";

  $(function () {
    // file upload
    function readURL(input, previewSelector) {
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $(previewSelector).css(
            "background-image",
            "url(" + e.target.result + ")",
          );
          $(previewSelector).hide().fadeIn(650);
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    if ($("#imageUpload").length > 0) {
      if ($("#imagePreview").length > 0) {
        $("#imageUpload").on("change", function () {
          readURL(this, "#imagePreview");
        });
      } else if ($("#imagenextPreview").length > 0) {
        $("#imageUpload").on("change", function () {
          readURL(this, "#imagenextPreview");
        });
      }
    }

    // show & hide password
    if ($(".toggle-password").length > 0) {
      $(".toggle-password").on("click", function () {
        $(this).toggleClass("active");
        var input = $($(this).attr("id"));
        if (input.attr("type") === "password") {
          input.attr("type", "text");
          $(this)
            .removeClass("ph-bold ph-eye-closed")
            .addClass("ph-bold ph-eye");
        } else {
          input.attr("type", "password");
          $(this).addClass("ph-bold ph-eye-closed");
        }
      });
    }

    if ($(".student-toggle-password").length > 0) {
      $(".student-toggle-password").on("click", function () {
        $(this).toggleClass("active");
        var input = $($(this).attr("id"));
        if (input.attr("type") === "password") {
          input.attr("type", "text");
          $(this)
            .removeClass("ph-bold ph-eye-closed")
            .addClass("ph-bold ph-eye");
        } else {
          input.attr("type", "password");
          $(this).addClass("ph-bold ph-eye-closed");
        }
      });
    }

    // scroll to top with progress bar
    const $progressWrap = $(".progress-wrap");
    const progressPath = document.querySelector(".progress-wrap path");

    if (!progressPath) return;

    const pathLength = progressPath.getTotalLength();

    progressPath.style.transition = "none";
    progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = "stroke-dashoffset 10ms linear";

    const updateProgress = () => {
      const scroll = $(window).scrollTop();
      const height = $(document).height() - $(window).height();
      const progress = pathLength - (scroll * pathLength) / height;
      progressPath.style.strokeDashoffset = progress;
    };

    const toggleProgressButton = () => {
      if ($(window).scrollTop() > 50) {
        $progressWrap.addClass("active-progress");
      } else {
        $progressWrap.removeClass("active-progress");
      }
    };

    updateProgress();
    toggleProgressButton();

    $(window).on("scroll", () => {
      updateProgress();
      toggleProgressButton();
    });

    $progressWrap.on("click", function (e) {
      e.preventDefault();
      $("html, body").animate({ scrollTop: 0 }, 550);
    });

    /**
     * ======================================
     * 28. footer copyright year
     * ======================================
     */
    if ($("#copyrightYear").length > 0) {
      $("#copyrightYear").text(new Date().getFullYear());
    }
  });

  // sticky header on scroll
  $(window).on("scroll", function () {
    if ($(window).scrollTop() >= 260) {
      $(".header").addClass("fixed-header");
    } else {
      $(".header").removeClass("fixed-header");
    }
  });
})(jQuery);

// preloader
$(window).on("load", function () {
  var preLoder = $(".preloader");
  preLoder.fadeOut(0);
});
