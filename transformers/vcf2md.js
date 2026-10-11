function transform(input, done) {
  const fs = require('fs');
  const path = require('path');
  const vcard = require('vcard-parser');

  const buff = fs.readFileSync(input, 'utf8');
  const card = vcard.parse(buff);

  const getVal = (prop) => (card[prop] && card[prop][0] ? card[prop][0].value : '');
  
  const fullName = getVal('fn') || 'Unknown Contact';
  const org = getVal('org');
  const title = getVal('title');
  const note = getVal('note');

  let header = {};
  header.type = 'Contact Information';
  header.title = fullName;
  header.resource = escape(path.basename(input));

  let markdown = '';
  markdown += '# ' + fullName + '\n\n';

  if (title) markdown += '**Title:** ' + title + '\n';
  if (org)   markdown += '**Organization:** ' + org + '\n';

  markdown += '\n## Contact Information\n';

  if (card.tel) {
    markdown += '\n### Phone Numbers:\n';

    card.tel.forEach(function (it) { 
      let t = it.meta.type;
      let v = it.value;

      markdown += '- **'+t+':** '+v+'\n';
    });
  }

  if (card.email) {
    markdown += '\n### Emails:\n';

    card.email.forEach(function (it) { 
      let t = it.meta.type;
      let v = it.value;

      markdown += '- **'+t+':** ['+v+'](mailto:'+v+')\n';
    });
  }

  if (card.url) {
    markdown += '\n### Websited and Links:\n';
  
    card.url.forEach(function (it) { 
      let t = it.meta.type;
      let v = it.value;

      markdown += '- **'+t+':** ['+v+']('+v+')\n';
    });
  }

  if (note) {
    markdown += '\n### Notes:\n';
    markdown += note;
  }

  done({metadata:header, content:markdown});
}

module.exports.transform = transform;
