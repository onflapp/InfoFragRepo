async function convert_html(html) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const tmp = require('tmp');
  const output = tmp.tmpNameSync()+'.pdf';

  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    margin: { top: '5px', right: '5px', bottom: '5px', left: '5px' }
  });

  await browser.close();

  return output;
}

function transform(input, done) {
  done();
}

module.exports = {
  convert_html:convert_html,
  transform:transform
};
