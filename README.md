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
  }
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
})
module.exports = cfg
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
