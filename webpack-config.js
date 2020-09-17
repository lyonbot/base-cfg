/* eslint-ignore */

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WebpackConfig = require('webpack-chain');

function arrayify(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  return [data]
}

function makeConfigChain({
  isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--development'),
  entry = { index: './src/index' },
  srcDir = path.resolve(process.cwd(), 'src'),
  outDir = path.resolve(process.cwd(), 'dist'),
  publicPath = '/dist/',

  enableTypeScript = true,
  enableVue = true,
} = {}) {
  const config = new WebpackConfig()

  config.mode(isDevelopment ? 'development' : 'production')
  config.devtool(isDevelopment ? 'eval-cheap-source-map' : 'cheap-source-map')

  for (const [k, v] of Object.entries(typeof entry === 'string' ? { index: entry } : entry)) {
    const ent = config.entry(k)
    arrayify(v).forEach(val => { ent.add(val) })
  }

  config.output
    .publicPath(publicPath)
    .path(outDir)
    .filename('[name].js')

  config.resolve.extensions.merge(['.js', '.jsx', '.json'])
  config.resolve.alias.set('~', srcDir)

  config.resolveLoader.modules.merge([
    'node_modules',
    path.resolve(__dirname, 'node_modules'),
  ])

  config.module.rule('SASS')
    .test(/\.s[ac]ss$/i)
    .use('style').loader('style-loader').end()
    .use('css').loader('css-loader').end()
    .use('sass').loader('sass-loader').options({ implementation: require('sass') }).end()

  config.module.rule('FILE')
    .test(/\.(png|jpg|gif|ttf|woff2?|otf)$/i)
    .use('file').loader('file-loader').end()

  config.module.rule('TXT')
    .test(/\.txt$/i)
    .use('raw').loader('raw-loader').end()

  config.module.rule('CSS')
    .test(/\.css$/i)
    .use('style').loader('style-loader').end()
    .use('css').loader('css-loader').end()

  config.module.rule('WORKER JS')
    .after('JS')
    .test(/\.worker\.jsx?$/)
    .use('worker').loader('worker-loader').options({ inline: true }).end()



  config.plugin('DEFINE').use(webpack.DefinePlugin, [{
    'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"',
  }])



  config.optimization.splitChunks({
    chunks: 'async',
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
    },
  })

  if (enableTypeScript) {
    config.resolve.extensions.merge(['.ts', '.tsx'])
    config.module.rule('TS')
      .test(/\.tsx?$/i)
      .use('ts').loader('ts-loader').options({ transpileOnly: true })

    config.module.rule('WORKER TS')
      .after('TS')
      .test(/\.worker\.tsx?$/)
      .use('worker').loader('worker-loader').options({ inline: true }).end()
      .use('ts').loader('ts-loader').options({ transpileOnly: true })

    config.plugin('TS').use(ForkTsCheckerWebpackPlugin)
  }

  if (enableVue) {
    config.resolve.extensions.merge(['.vue'])
    config.module.rule('VUE')
      .test(/\.vue$/i)
      .use('vue').loader('vue-loader')

    config.plugin('VUE').use(VueLoaderPlugin)
  }

  return config
}

/**
 * 
 * @param {Parameters<typeof makeConfigChain>[0]} [opts] 
 */
function makeConfig(opts) {
  const chain = makeConfigChain(opts)
  return chain.toConfig()
}

exports.makeConfig = makeConfig;
exports.makeConfigChain = makeConfigChain;
