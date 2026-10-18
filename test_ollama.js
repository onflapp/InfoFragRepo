const Ollama= require('ollama').Ollama;
const ollama = new Ollama();
const sh = require('shelljs');

// test_ollama "prompt' ./text.txt

async function main() {
  let pro = process.argv[2];
  let txt = sh.cat(process.argv[3]).stdout;
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    options: {
      num_ctx: 64000
    },
    messages: [{ role: 'user', content: pro + ':\n\n' + txt }]
  });
  console.log(response.message.content);
}

main();
