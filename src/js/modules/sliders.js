import "slick-carousel";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

(function ($) {
  "use strict";

  $(function () {
    // testimonial six slider
    $(".tastimonial-six-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#tastimonial-six-next",
      prevArrow: "#tastimonial-six-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // popular tutor six slider
    $(".our-popular-tutors-six-slider").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#our-popular-tutors-six-next",
      prevArrow: "#our-popular-tutors-six-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 3,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // faq brand slider
    $(".faq-brand-slider").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      centerPadding: "100px",
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: false,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#brand-next",
      prevArrow: "#brand-prev",
      responsive: [
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 3,
            arrows: false,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 424,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
        {
          breakpoint: 359,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // testimonial five slider
    $(".testimonial-five-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#testimonial-five-next",
      prevArrow: "#testimonial-five-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // popular slider
    $(".our-popular-slider").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#our-popular-next",
      prevArrow: "#our-popular-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // brand slider
    $(".brand-slider").slick({
      slidesToShow: 7,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: false,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#brand-next",
      prevArrow: "#brand-prev",
      responsive: [
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 6,
            arrows: false,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 5,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 4,
            arrows: false,
          },
        },
        {
          breakpoint: 424,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 359,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
      ],
    });

    // features slider
    $(".features-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#features-next",
      prevArrow: "#features-prev",
      responsive: [
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // instructor slider
    $(".instructor-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#instructor-next",
      prevArrow: "#instructor-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // testimonial thumbs slider
    $(".testimonials__thumbs-slider").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      asNavFor: ".testimonials__slider",
    });

    $(".testimonials__slider").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      asNavFor: ".testimonials__thumbs-slider",
      dots: false,
      arrows: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      focusOnSelect: true,
      nextArrow: "#testimonials-next",
      prevArrow: "#testimonials-prev",
    });

    // category slider
    $(".category-item-slider").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#category-next",
      prevArrow: "#category-prev",
      responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 3,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // testimonial two slider
    $(".testimonials-two-slider").slick({
      slidesToShow: 2,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#testimonials-two-next",
      prevArrow: "#testimonials-two-prev",
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // banner three slider
    $(".banner-three__slider").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      fade: true,
      nextArrow: "#banner-three-next",
      prevArrow: "#banner-three-prev",
    });

    $(".banner-three__slider").on(
      "beforeChange",
      function (event, slick, currentSlide, nextSlide) {
        $(".wow").css("visibility", "hidden").removeClass("animated");
      },
    );

    $(".banner-three__slider").on(
      "afterChange",
      function (event, slick, currentSlide) {
        new WOW().init();
        $(".wow").css("visibility", "visible");
      },
    );

    // testimonial three slider
    $(".testimonials-three-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      centerMode: true,
      centerPadding: "0px",
      nextArrow: "#testimonials-three-next",
      prevArrow: "#testimonials-three-prev",
      responsive: [
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // blog two slider
    $(".blog-two-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#blog-two-next",
      prevArrow: "#blog-two-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // tutor slider
    $(".tutor-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#tutor-next",
      prevArrow: "#tutor-prev",
      responsive: [
        {
          breakpoint: 1299,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // review slider
    $(".review-slider, .review-slider-two").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: true,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: "#review-slider-next",
      prevArrow: "#review-slider-prev",
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });

    // product slider
    $(".product-big-thumbs").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      fade: true,
      asNavFor: ".product-small-thumbs",
    });

    $(".product-small-thumbs").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: ".product-big-thumbs",
      arrows: false,
      dots: false,
      rtl: $("html").attr("dir") === "rtl" ? true : false,
      autoplay: false,
      centerMode: true,
      responsive: [
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 424,
          settings: {
            slidesToShow: 2,
          },
        },
      ],
    });
  });
})(jQuery);
