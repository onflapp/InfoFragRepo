const fs = require('fs');

function cleanup_text(html) {
  let r = html;
  r = r.replace(/<!--.*-->/, '');
  r = r.replace(/@media.*\{.*\}/, '');
  return r;
}

function escape_yaml(text) {
  return text.replace(/'/, '');
}

function transform(input, done) {
  const path = require('path');
  const { simpleParser } = require('mailparser');

  const Turndown = require('turndown');
  const td = new Turndown({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });

  td.addRule('images', {
    filter: ['img','video'],
    replacement: function (content) {
      return '';
    }
  });

  const buff = fs.readFileSync(input);
  
  simpleParser(buff).then(function(email) {
    let htmlContent = email.html;
    let markdownOutput = '';

    let header = {};
    header.type = 'Email Message Content';
    header.title = (email.subject || 'No Subject');
    header.resource = escape(path.basename(input));

    markdownOutput += '**From:** ' + (email.from?.text || 'Unknown') + '\n';
    markdownOutput += '**To:** ' + (email.to?.text || 'Unknown') + '\n';
    markdownOutput += '**Date:** ' + (email.date ? email.date.toISOString() : 'Unknown') + '\n';
    markdownOutput += '\n\n\n---\n\n\n';

    if (htmlContent) {
      markdownOutput += cleanup_text(td.turndown(htmlContent));

      done({metadata:header, content:markdownOutput});
    } 
    else if (email.text) {
      markdownOutput += cleanup_text(parsedEmail.text);

      done({metadata:head, content:markdownOutput});
    } 
    else {
      console.log('the email contains no readable HTML or text body.');
      done();
    }
  });
}

module.exports.transform = transform;
