# @lyonbot/base-cfg

个人的常用 webpack 和 typescript 配置的东西

## package.json

```json
{
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --development"
  },
  "devDependencies": {
    "@lyonbot/base-cfg": "^1.0.0"
  },
  "browserslist": "> 0.5%, last 2 versions, Firefox ESR, not dead"
}
```

## webpack

约定：

- `src` 下放源代码
- `dist` 下放输出的东西
- 支持 scss、typescript、vue
- 可以通过 `~/xxx` 直接定位到项目源代码根文件夹

在项目下创建 webpack.config.js

```js
const { makeConfig } = require('@lyonbot/base-cfg/webpack-config')

const cfg = makeConfig({ 
  entry: { index: './src/index' },
  
  extractCss: true,
  enableHTML: true,
  htmlPages: { index: ['index'] },
});

module.exports = cfg;
```

## typescript

约定：

- 严格模式
- 支持 JSX，React 的形式

在项目下创建 tsconfig.json

```json
{
  "extends": "./node_modules/@lyonbot/base-cfg/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "baseUrl": "src",
    "paths": {
      "~/*": [ "./*" ],
    },
  },
  "include": [
    "./node_modules/@lyonbot/base-cfg/*.d.ts",
    "./src/**/*.ts",
    "./src/**/*.tsx",
  ]
}
```

## 使用 postcss 和 babel

首先你需要在 package.json 里设置 [browserslist](https://github.com/browserslist/browserslist#readme)，例如：

- `"browserslist": "Android >= 4.4, iOS >= 8",`
- `"browserslist": "> 1%, IE 10",`

然后执行命令即可：

```sh
npm i -D \
  postcss postcss-loader autoprefixer cssnano \
  @babel/core @babel/preset-env babel-loader

>postcss.config.js      cat <<EOF
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }),
  ]
}
EOF

>babel.config.js        cat <<EOF
module.exports = {
  presets: ["@babel/preset-env"],
};
EOF
```
