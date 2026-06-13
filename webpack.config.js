const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require("glob");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const cssOutputPath = env && env.cssFolder ? env.cssFolder : "css";

  return {
    entry: "./src/js/app.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "js/app.bundle.js",
      clean: true,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
      client: {
        overlay: true,
        progress: true,
      },
      watchFiles: ["src/**/*.html", "src/**/*.scss"],
      devMiddleware: {
        writeToDisk: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.(s[ac]ss|css)$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: "postcss-loader",
            },
          ],
        },
        {
          test: /\.html$/i,
          use: [
            {
              loader: "html-loader",
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico|eot|ttf|woff)$/i,
          type: "asset/resource",
          generator: {
            filename: (pathData) => {
              return `images${pathData.filename.replace("src/images", "")}`;
            },
          },
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: [".js", ".mjs"],
      fullySpecified: false,
    },
    plugins: [
      ...glob.sync("./src/**/*.html").map((file) => {
        return new HtmlWebpackPlugin({
          template: file,
          filename: path.basename(file),
          minify: isProduction
            ? {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
              }
            : false,
          cache: true,
        });
      }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
      }),

      new MiniCssExtractPlugin({
        filename: `${cssOutputPath}/app.min.css`,
      }),
    ],
    mode: isProduction ? "production" : "development",
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
    performance: {
      hints: isProduction ? "warning" : false,
      maxAssetSize: 1000000,
      maxEntrypointSize: 1000000,
    },
  };
};
