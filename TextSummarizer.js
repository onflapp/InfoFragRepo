class OllamaTextSummarizer {
  constructor() {
    const Ollama= require('ollama').Ollama;
    this.ollama = new Ollama();
  }

  async summarizeText(action, text) {
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
    return txt;
  }
}

module.exports = OllamaTextSummarizer;
