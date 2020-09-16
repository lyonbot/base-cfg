const { makeConfig } = require('@lyonbot/base-cfg/webpack-config');

const cfg = makeConfig({
  entry: { index: './src/index' },
});
module.exports = cfg;
