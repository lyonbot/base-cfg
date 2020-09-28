import './index.css'
import HelloWorker from './foobar.worker';
const Vue = require('vue').default

const amazingTest = async (vue) => {
  console.log('Vue version = ', vue.version)
  const foo = await (await fetch('xxx')).text()
  if (/^\d+$/.test(foo)) await fetch('yyy')
  return foo
}

amazingTest(Vue)

const worker = new HelloWorker()
worker.onmessage = function (ev) {
  console.log('worker: ' + ev.data.text)
}
worker.postMessage({ name: 'John' })
