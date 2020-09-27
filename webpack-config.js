/* eslint-ignore */

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WebpackConfig = require('webpack-chain');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function tryResolve(id) {
  try {
    return require.resolve(id, { paths: [process.cwd()] })
  } catch (e) {
    console.log("id", id, e)
    return undefined
  }
}

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

  filename = isDevelopment ? '[name]' : '[name].[chunkhash:6]',
  extractCss = true,

  enableHTML = false,
  htmlTemplate = '',  // <html>....</html>
  htmlPages = { index: ['index'] },

  enableTypeScript = fs.existsSync('tsconfig.json'),
  enableVue = true,
  enablePostCSS = !!tryResolve('postcss-loader'),
  enableBabel = !!tryResolve('babel-loader'),
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
    .filename(`${filename}.js`)

  config.resolve.extensions.merge(['.js', '.jsx', '.json'])
  config.resolve.alias.set('~', srcDir)

  config.resolveLoader.modules.merge([
    'node_modules',
    path.resolve(__dirname, 'node_modules'),
  ])

  config.module.rule('JS')
    .test(/\.jsx?$/i)

  config.module.rule('SASS')
    .test(/\.s[ac]ss$/i)
    .use('style').loader('style-loader').end()
    .use('css').loader('css-loader').end()
    .use('sass').loader('sass-loader').options({ implementation: require('sass') }).end()

  config.module.rule('FILE')
    .test(/\.(png|jpg|gif|ttf|woff2?|otf|mp4|mp3|ogg|m4a|webp|webm)$/i)
    .use('file').loader('file-loader').end()

  config.module.rule('TXT')
    .test(/\.txt$/i)
    .use('raw').loader('raw-loader').end()

  config.module.rule('CSS')
    .test(/\.css$/i)
    .use('style').loader('style-loader').end()
    .use('css').loader('css-loader').end()

  config.module.rule('WORKER JS')
    .before('JS')
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

    config.plugin('ForkTsCheckerWebpackPlugin').use(ForkTsCheckerWebpackPlugin)
  }

  if (enableVue) {
    config.resolve.extensions.merge(['.vue'])
    config.module.rule('VUE')
      .test(/\.vue$/i)
      .use('vue').loader('vue-loader')

    config.plugin('VueLoaderPlugin').use(VueLoaderPlugin)
  }

  if (enableBabel) {
    config.module.rule('JS')
      .use('babel').loader('babel-loader').end()

    config.module.rule('WORKER JS')
      .use('babel').loader('babel-loader').before('worker').end()

    if (enableTypeScript) {
      config.module.rule('TS')
        .use('babel').loader('babel-loader').before('ts').end()

      config.module.rule('WORKER TS')
        .use('babel').loader('babel-loader').before('worker').end()
    }
  }

  if (enablePostCSS) {
    config.module.rule('SASS')
      .use('postcss').loader('postcss-loader').after('css').end()

    config.module.rule('CSS')
      .use('postcss').loader('postcss-loader').after('css').end()
  }

  if (extractCss) {
    config.module.rule('SASS')
      .uses.delete('style').end()
      .use('MiniCssExtractPlugin').before('css').loader(MiniCssExtractPlugin.loader).end()

    config.module.rule('CSS')
      .uses.delete('style').end()
      .use('MiniCssExtractPlugin').before('css').loader(MiniCssExtractPlugin.loader).end()

    config.plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin, [{ filename: `${filename}.css` }])
  }

  if (enableHTML) {
    Object.keys(htmlPages).forEach(id => {
      config.plugin('html:' + id).use(
        HtmlWebpackPlugin,
        [{
          filename: `${id}.html`,
          chunks: htmlPages[id],
          ...htmlTemplate ? { templateContent: htmlTemplate } : {},
        }]
      )
    })
  }

  // postprocess

  {
    // delete empty rules
    for (const [id, rule] of Object.entries(config.module.rules.entries())) {
      if (rule.uses.values().length === 0) {
        config.module.rules.delete(id)
      }
    }
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
