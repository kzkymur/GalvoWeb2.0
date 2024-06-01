const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const src = path.resolve(__dirname, "src");
const srcWasm = path.resolve(__dirname, "src-wasm");
const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "development",
  entry: [src + "/index.tsx", srcWasm + "/index.wasm"],

  output: {
    path: dist,
    publicPath: "/",
    filename: "index.js",
  },

  devtool: "inline-source-map",

  module: {
    rules: [
      {
        test: /\.(wasm|eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(t|j)(s|sx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
    alias: {
      "@": src,
      "@wasm": srcWasm,
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: src + "/index.html",
      filename: "index.html",
    }),
  ],
  devServer: {
    port: 8080,
    historyApiFallback: true,
    static: {
      directory: srcWasm,
    },
  },
};
