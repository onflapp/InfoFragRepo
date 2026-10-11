function transform(input, dest, done) {
  const fs = require('fs');
  const vcard = require('vcard-parser');
  const text2preview = require('./text2preview');
  const output = dest+'/content.md';

  const buff = fs.readFileSync(input, 'utf8');
  const card = vcard.parse(buff);

  const getVal = (prop) => (card[prop] && card[prop][0] ? card[prop][0].value : '');
  
  const fullName = getVal('fn') || 'Unknown Contact';
  const org = getVal('org') || 'N/A';
  const title = getVal('title') || 'N/A';
  const note = getVal('note') || 'No notes available.';

  // Map lists of properties like phone and email
  const phones = card.tel ? card.tel.map(t => `- **${(t.meta?.type || ['Phone']).join('/')}:** ${t.value}`).join('\n') : '* No phone numbers';
  const emails = card.email ? card.email.map(e => `- **${(e.meta?.type || ['Email']).join('/')}:** [${e.value}](mailto:${e.value})`).join('\n') : '* No email addresses';
  const urls = card.url ? card.url.map(u => `- [${u.value}](${u.value})`).join('\n') : '* No websites';

  const markdown = `# ${fullName}
${title !== 'N/A' ? `**Title:** ${title}  \n` : ''}${org !== 'N/A' ? `**Organization:** ${org}` : ''}

## Contact Information
${phones}

## Electronic Details
### Emails
${emails}

### Links & Websites
${urls}

## Notes
${note}
`;

  fs.writeFile(output, markdown, 'utf-8', function(err) {
    text2preview.transform(output, dest, function(ipath) {
      done([output]);
    });
  });
}

module.exports.transform = transform;
