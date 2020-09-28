const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

onmessage = async (event) => {
  await delay(500)
  postMessage({ text: 'Hello, ' + event.data.name });
};
