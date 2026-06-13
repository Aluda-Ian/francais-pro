(function ($) {
  "use strict";

  $(function () {
    //  toggle dashboard sidebar
    $(".toggle-student-dashbord-button").on("click", function () {
      $(".student-dashboard-sidebar").addClass("active");
      $(".student-overlay-sidebar").addClass("show");
    });

    $(".sidebar-close, .student-overlay-sidebar").on("click", function () {
      $(".student-dashboard-sidebar").removeClass("active");
      $(".student-overlay-sidebar").removeClass("show");
    });

    $(".toggle-dashbord-button").on("click", function () {
      $(".dashboard-sidebar").addClass("active");
      $(".side-overlay").addClass("show");
    });

    $(".sidebar-close, .side-overlay").on("click", function () {
      $(".dashboard-sidebar").removeClass("active");
      $(".side-overlay").removeClass("show");
    });

    // text rotation animation
    const text = document.querySelector(".circle__text");

    if (text) {
      text.innerHTML = text.innerText
        .split("")
        .map(
          (char, i) =>
            `<span style="transform:rotate(${i * 11.5}deg)">${char}</span>`,
        )
        .join("");
    }

    const textTwo = document.querySelector(".circle__desc");

    if (textTwo) {
      textTwo.innerHTML = textTwo.innerText
        .split("")
        .map(
          (char, i) =>
            `<span style="transform:rotate(${i * 11.5}deg)">${char}</span>`,
        )
        .join("");
    }

    // progress bar

    $(".progress-wrapper").each(function () {
      const percentage = $(this).data("perc");
      const $floatingLabel = $(this).find(".floating-label");

      $floatingLabel.css("animation", "none");

      $floatingLabel[0].offsetHeight;

      $floatingLabel.css({
        "--left-percentage": percentage,
        animation: "animateFloatingLabel 2s linear forwards",
      });
    });

    // Semi Circle progress bar
    $(".progressBar").each(function () {
      var $bar = $(this).find(".circleBar");
      var $val = $(this).find(".barNumber");
      var perc = parseInt($val.text(), 10);

      $({ p: 0 }).animate(
        { p: perc },
        {
          duration: 3000,
          easing: "swing",
          step: function (p) {
            $bar.css({
              transform: "rotate(" + (45 + p * 1.8) + "deg)",
            });
            $val.text(p | 0);
          },
        },
      );
    });

    // mobile menu and sidebar toggle
    $(".toggle-mobileMenu").on("click", function () {
      $(".mobile-menu").addClass("active");
      $(".side-overlay").addClass("show");
      $("body").addClass("scroll-hide-sm");
    });

    $(".close-button, .side-overlay").on("click", function () {
      $(".mobile-menu").removeClass("active");
      $(".side-overlay").removeClass("show");
      $("body").removeClass("scroll-hide-sm");
    });

    // mobile menu dropdown
    var windowWidth = $(window).width();

    $(".has-submenu").on("click", function () {
      var thisItem = $(this);

      if (windowWidth < 992) {
        if (thisItem.hasClass("active")) {
          thisItem.removeClass("active");
        } else {
          $(".has-submenu").removeClass("active");
          $(thisItem).addClass("active");
        }

        var submenu = thisItem.find(".nav-submenu");

        $(".nav-submenu").not(submenu).slideUp(300);
        submenu.slideToggle(300);
      }
    });

    // add active class to the current page
    function dynamicActiveMenuClass(selector) {
      let FileName = window.location.pathname.split("/").reverse()[0];

      if (FileName === "" || FileName === "index.html") {
        selector
          .find("li.nav-menu__item.has-submenu")
          .eq(0)
          .addClass("activePage");
      } else {
        selector.find("li").removeClass("activePage");

        selector.find("li").each(function () {
          let anchor = $(this).find("a");
          if ($(anchor).attr("href") == FileName) {
            $(this).addClass("activePage");
          }
        });

        selector.children("li").each(function () {
          if ($(this).find(".activePage").length) {
            $(this).addClass("activePage");
          }
        });
      }
    }

    if ($("ul").length) {
      dynamicActiveMenuClass($("ul"));
    }

    // wishlist button
    $(".wishlist-btn").on("click", function () {
      $(this).removeClass("text-main-two-600");
      $(this).toggleClass("text-white bg-main-two-600");
    });

    // instruction button
    $(".social-infos .social-infos__button").on("click", function () {
      $(".social-list")
        .not($(this).siblings(".social-list"))
        .removeClass("flex");
      $(".social-infos .social-infos__button")
        .not($(this))
        .removeClass("active");
      $(this).siblings(".social-list").toggleClass("flex");
      $(this).toggleClass("active");
    });

    // instructor button
    $(".our-popular-five .our-popular-five__button").on("click", function () {
      $(".social-list")
        .not($(this).siblings(".social-list"))
        .removeClass("flex");
      $(".our-popular-five .our-popular-five__button")
        .not($(this))
        .removeClass("active");
      $(this).siblings(".social-list").toggleClass("flex");
      $(this).toggleClass("active");
    });

    // list sidebar
    $(".list-bar-btn").on("click", function () {
      $(".sidebar").addClass("active");
      $(".side-overlay").addClass("show");
    });

    $(".sidebar-close, .side-overlay").on("click", function () {
      $(".sidebar").removeClass("active");
      $(".side-overlay").removeClass("show");
    });

    // increment cart quantity
    var minus = $(".quantity__minus");
    var plus = $(".quantity__plus");

    $(plus).on("click", function () {
      var input = $(this).siblings(".quantity__input");
      var value = input.val();
      value++;
      input.val(value);
    });

    $(minus).on("click", function () {
      var input = $(this).siblings(".quantity__input");
      var value = input.val();
      if (value > 1) {
        value--;
      }
      input.val(value);
    });

    // colors list
    $(".color-list__button").on("click", function () {
      $(".color-list__button").removeClass("active");

      if (!$(this).hasClass("active")) {
        $(this).addClass("active");
        $(this).removeClass("border-neutral-50");
      } else {
        $(this).removeClass("active");
        $(this).addClass("border-neutral-50");
      }
    });

    // add to cart
    $(".add-to-cart").on("click", function () {
      $(this).toggleClass("active");
    });
  });
})(jQuery);
