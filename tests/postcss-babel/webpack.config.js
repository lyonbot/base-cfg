const { makeConfig } = require('@lyonbot/base-cfg/webpack-config')

const cfg = makeConfig({
  entry: { index: './src/index' },

  extractCss: true,
  enableHTML: true,
  htmlPages: { index: ['index'] },
});

// console.log("cfg", cfg.module.rules.map(x => `
//   ${x.test} :
//     ${x.use.map(y => y.loader)}
// `).join('\n'))

// process.exit()

module.exports = cfg;
