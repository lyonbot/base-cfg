/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */

declare module 'raw-loader!*' {
  const val: string;
  export default val;
}

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.jpg' {
  const url: string;
  export default url;
}

declare module '*.png' {
  const url: string;
  export default url;
}

declare interface NodeRequire {
  context(dir: string, useSubdirectories: boolean, regExp: RegExp): {
    (key: string): any
    resolve(): any
    keys(): string[]
  }
}

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare let __webpack_public_path__: string;
