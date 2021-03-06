const { makeConfig } = require('@lyonbot/base-cfg/webpack-config')

const cfg = makeConfig({ 
  entry: { index: './src/index' },
  
  extractCss: true,
  enableHTML: true,
  htmlPages: { index: ['index'] },
});

module.exports = cfg;
