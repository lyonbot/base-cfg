module.exports = {
  presets: [
    ["@babel/preset-env", {
      corejs: 3,
      useBuiltIns: 'usage'
    }]
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    // "@babel/plugin-transform-modules-commonjs",
  ],
};
