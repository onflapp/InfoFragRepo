const fs = require('fs');
const tools = require('./../TextTools');

const reject = [
  /^\*\*Cc:/,
  /^\*\*Join:/,
  /^\*\*When:/,
  /^\*\*Where:/,
  /^\*\*ATTENTION:/,
  /^\*\*EXTERNAL:/,
  /^\*\*Microsoft\ Teams meeting\*\*/,
  /^Meeting\ ID:/,
  /^Passcode:/,
  /^Tenant\ key:/,
  /^\*\*Dial\ in\ by\ phone\*\*/,
  /^Phone\ conference\ ID:/,
  /^\*\*Join\ on\ a\ video\ conferencing\ device\*\*/,
  /^Video\ ID:/,
  /^NOTE:\ This\ meeting\ could\ be\ recorded,/,
  /^\[Need\ help\?\]/,
  /^\[Find\ a\ local\ number\]/,
  /^\[More\ info\]/,
  /^Thanks,/,
  /^Thanks a lot,/,
  /^Thank\ you,/
];

const accept = [
  /^\*\*From:\*\*/
];

function cleanup_text(html) {
  let r = html;
  r = r.replace(/<!--.*-->/, '');
  r = r.replace(/@media.*\{.*\}/, '');
  r = tools.deduplicate_text(r, accept, reject);

  return r;
}

function escape_yaml(text) {
  return text.replace(/'/, '');
}

function parse_body(input, done) {
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

    markdownOutput += '**From:** ' + (email.from?.text || 'Unknown') + '  \n';
    markdownOutput += '**To:** ' + (email.to?.text || 'Unknown') + '  \n';
    markdownOutput += '**Date:** ' + (email.date ? email.date.toISOString() : 'Unknown') + '  \n';
    markdownOutput += '\n\n\n---\n\n\n';

    if (htmlContent) {
      markdownOutput += cleanup_text(td.turndown(htmlContent));

      done(header, markdownOutput);
    } 
    else if (email.text) {
      markdownOutput += cleanup_text(parsedEmail.text);

      done(header, markdownOutput);
    } 
    else {
      console.log('the email contains no readable HTML or text body.');
      done();
    }
  });
}

function transform(input, done) {
  const action = 'Summarize the email thread in 3 sentences. Highlight main topic the thread is about. Focus on the latest status of any decision, agreement and next steps.';

  parse_body(input, function(headers, markdown) {

    if (markdown.length < 1000) {
      done({metadata:headers, content:markdown});
    }
    else if (markdown.length > 10000) {
      tools.summarize_text(action, markdown.substr(0, 10000), function(summary) {
        done({metadata:headers, content:markdown, summary:summary});
      });
    }
    else {
      tools.summarize_text(action, markdown, function(summary) {
        done({metadata:headers, content:markdown, summary:summary});
      });
    }
  });
}

module.exports = {
  transform:transform,
  parse_body:parse_body
};
