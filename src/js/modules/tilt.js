import VanillaTilt from "vanilla-tilt";

const tiltItems = document.querySelectorAll(".vanilla-tilt");

if (tiltItems.length > 0) {
  VanillaTilt.init(tiltItems, {
    max: 5,
    speed: 3000,
    scale: 1.03,
  });
}
