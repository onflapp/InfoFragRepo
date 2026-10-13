const sh = require('shelljs');
const paths = require('path');
const matter = require('gray-matter');

let path = process.argv[2];

let list = sh.find(path).filter((file) => { return file.match(/info\.md$/); });

list.forEach((it) => {
  let dir = paths.dirname(it);
  let idata = sh.cat(dir+'/info.md').stdout;
  let iinfo = matter(idata);
  let write = false;

  if (!iinfo.data.resource) {
    //console.log(dir);
  }

  if (!iinfo.data.group) {
    let group = paths.basename(paths.dirname(dir));
    iinfo.data.group = group;
    write = true;
  }

  if (!iinfo.data.timestamp) {
    console.log('no timestamp');
  }

  if (typeof iinfo.data.timestamp == 'string' && iinfo.data.timestamp.length != 24) {
    let nd = (''+iinfo.data.timestamp).replace(/\..*$/, '')+':00.000Z';
    iinfo.data.timestamp = nd;
    write = true;
  }


  if (write) {
    let str = matter.stringify(iinfo.content, iinfo.data);
    (new sh.ShellString(str)).to(dir+'/info.md');
    console.log(dir);
  }

  if (sh.test('-f', dir+'/content.md')) {
    try {
      let cdata = sh.cat(dir+'/content.md').stdout;
      let cinfo = matter(cdata);
    }
    catch(ex) {
      console.log('error:'+dir+'/content.md');
    }
  }
  //console.log(iinfo);
});
