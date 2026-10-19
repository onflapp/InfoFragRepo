class OllamaTextSummarizer {
  constructor() {
    const Ollama= require('ollama').Ollama;
    this.ollama = new Ollama();
  }

  async summarizeText(action, text) {
    try {
      const response = await this.ollama.chat({
        model: 'llama3.2:3b',
        options: {
          num_ctx: 64000
        },
        messages: [{ role: 'user', content: action + ':\n\n' + text }]
      });
    
      let txt = response.message.content;
      if (txt.match(/^Here is/)) {
        txt = txt.replace(/^Here is.*?\n+/, '');
      }
      else if (txt.match(/^This is a/)) {
        txt = txt.replace(/^This is a.*?\n+/, '');
      }

      return txt;
    }
    catch(ex) {
      console.log(ex);
      return null;
    }
  }
}

module.exports = OllamaTextSummarizer;
