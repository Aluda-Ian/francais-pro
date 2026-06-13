module.exports = {
  plugins: [
    require("@tailwindcss/postcss"),
    require("autoprefixer"),
    require("postcss-normalize-charset"),
    ...(process.env.NODE_ENV === "production"
      ? [require("cssnano")({ preset: "default" })]
      : []),
  ],
};
