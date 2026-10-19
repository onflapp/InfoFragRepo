const Ollama = require('ollama').Ollama;
const new_queue = require('@henrygd/queue').newQueue;
const utils = require('./utils');

class OllamaTextSummarizer {
  constructor() {
    this.ollama = new Ollama();
    this.stats = utils.track_stats('/tmp/llm.stats');
    this.queue = new_queue(4);
  }

  async summarizeText(action, text) {
    let self = this;
    return this.queue.add(async () => {
      const MAX = 64000;
      let itext = text;
      if (itext.length > MAX) itext = itext.substr(0, MAX);

      let t = 't'+(new Date()).getTime();
      let q = self.stats;
      
      q.start(t);
      try {
        const response = await self.ollama.chat({
          model: 'llama3.2:3b',
          options: {
            num_ctx: 64000
          },
          messages: [{ role: 'user', content: action + ':\n\n' + itext }]
        });
      
        let txt = response.message.content;

        if      (txt.match(/^Here is/))   txt = txt.replace(/^Here is.*?\n+/, '');
        else if (txt.match(/^Here are/))  txt = txt.replace(/^Here are.*?\n+/, '');
        else if (txt.match(/^This is a/)) txt = txt.replace(/^This is a.*?\n+/, '');
        else if (txt.match(/^These are/)) txt = txt.replace(/^These are.*?\n+/, '');

        q.end(t);
        return txt;
      }
      catch(ex) {
        q.end(t);
        console.log(ex);
        return null;
      }
    });
  }
}

module.exports = OllamaTextSummarizer;
