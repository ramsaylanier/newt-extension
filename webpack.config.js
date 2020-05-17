const path = require("path");

module.exports = {
  mode: "development",
  entry: "./linker.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "linker.bundle.js",
  },
};
