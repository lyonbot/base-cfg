import './index.css'

async function amazingTest(){
  const foo = await (await fetch('xxx')).text()
  if (/^\d+$/.test(foo)) await fetch('yyy')
  return foo
}

amazingTest()
