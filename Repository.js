const fs = require('fs-extra');
const paths = require('node:path');
const hash= require('hash.js');
const utils = require('./utils.js');
const Fragment = require('./Fragment');
const Transformer = require('./Transformer');

class Repository {
  constructor(filePath) {
    this.filePath = utils.resolve_path(filePath);
    this.mdRegistry = utils.read_json('./files2md.json');
    this.previewRegistry = utils.read_json('./files2preview.json');
  }

  _fragmentToFilePath(path) {
    return paths.join(this.filePath, path);
  }

  _makeName(group, file) {
    if (file) {
      let h = hash.sha1().update(file).digest('hex');
      let n = 'extern/'+h.substr(0,2)+'/'+h.substr(2);

      if (group) return group+'/'+n;
      else return n;
    }
    else {
      let t = Date.now();
      let n = t + '-' + Math.round(Math.random() * 1E9);

      if (group) return group+'/'+n;
      else return n;
    }
  }

  async _make_summary(txt) {
    return new Promise((done) => {
      const action = 'Summarize content of the document in 3 sentences.';
      const tools = require('./TextTools');

      if (txt.length < 1000) {
        done(txt);
      }
      else if (txt.length > 5000) {
        tools.summarize_text(action, txt.substr(0, 5000), function(summary) {
          done(summary);
        });
      }
      else {
        tools.summarize_text(action, txt, function(summary) {
          done(summary);
        });
      }

    });
  }

  async _make_thumbnail(input) {
    let ext = paths.extname(input);
    let dir = paths.dirname(input);
    let thumbnail = paths.join(dir, 'thumbnail.png');

    if (ext == '.pdf') {
      return new Promise((done) => {
        const itools =require('./ImageTools');
        itools.make_thumbnail_pdf(input, function(buff) {
          fs.writeFile(thumbnail, buff, function() {
            done();
          });
        });
      });
    }
    else {
      return new Promise((done) => {
        const itools =require('./ImageTools');
        itools.make_thumbnail_img(input, function(buff) {
          fs.writeFile(thumbnail, buff, function() {
            done();
          });
        });
      });
    }
  }

  async _generate(frag, input) {
    const trans = new Transformer(this.previewRegistry);

    return new Promise((done, error) => {
      trans.transformInput(input).then((rv) => {
        let dir = frag.fragmentPath();

        if (rv && rv.preview) {
          let ext = paths.extname(rv.preview);
          let out = paths.join(dir, 'preview'+ext);
          fs.move(rv.preview, out, {overwrite: true});

          console.log(out);
        }

        if (rv && rv.thumbnail) {
          let ext = paths.extname(rv.thumbnail);
          let out = paths.join(dir, 'thumbnail'+ext);
          fs.move(rv.thumbnail, out, {overwrite: true});

          console.log(out);
        }

        done();
      });
    });
  }

  async _transform(frag, input) {
    const trans = new Transformer(this.mdRegistry);

    return new Promise((done, error) => {
      trans.transformInput(input).then((rv) => {
        if (rv) {
          if (!rv.content) {
            console.log('no content for '+input);
            console.log(rv);
          }

          frag.storeContent(rv.metadata, rv.content, rv.summary).then(() => {
            done(input);
          });
        }
        else {
          console.log('ERROR:' + input);
          done();
        }
      });
    });
  }

  async listFragments(path) {
    let rv = [];
    try {
      let fdir = this._fragmentToFilePath(path);
      let ls = await fs.readdir(fdir, { withFileTypes: true });

      for (const item of ls) {
        if (item.isDirectory()) {
          let ipath = paths.join(fdir, item.name, 'info.md');
          let fpath = paths.join(fdir, item.name);

          if (fs.existsSync(ipath)) {
            let frag = new Fragment(fpath);
            let info = await frag.readInformation();

            rv.push(info);
          }
        }
      }
    } 
    catch (err) {
      console.error(err);
    }

    return rv;
  }

  async readFragmentContentAtPath(fpath) {
    let fdir = this._fragmentToFilePath(fpath);
    let frag = new Fragment(fdir);

    if (frag.isReadable()) {
      return await frag.readContent();
    }
    else {
      return null;
    }
  }

  async updateFragmentContent(path) {
    let frag = new Fragment(path);
    if (!frag.isReadable()) return;

    let fdir = frag.fragmentPath();
    let ls = await fs.readdir(fdir, { withFileTypes: true });

    let ignore = ['info.md', 'content.md', 'summary.md', 'preview.png', 'preview.pdf', 'thumbnail.png'];
    let tfile = null;

    for (const item of ls) {
      if (!item.isDirectory() && ignore.indexOf(item.name) == -1 && item.name.charAt(0) != '.') {
        tfile = paths.join(fdir, item.name);
        break;
      }
    }

    if (tfile) {
      await this._transform(frag, tfile);
      await this._generate(frag, tfile);
    }
    else {
      let ifile = paths.join(fdir, 'info.md');
      await this._generate(frag, ifile);
    }

    return frag.fragmentPath();
  }

  async addExternalFragment(info, file) {
    let dir = paths.join(this.filePath, this._makeName(info.group, file));
    let title = info.title;

    await fs.ensureDir(dir);
    let frag = new Fragment(dir);

    await this._transform(frag, file);
    await this._generate(frag, file);

    console.log(info);
    await frag.writeInformation(info);

    return frag.fragmentPath();
  }

  async createFragment(info, file) {
    let dir = paths.join(this.filePath, this._makeName(info.group));
    let title = info.title;
    let name = info.filename;

    if (!name) name = title || 'untitled';
    name = name.replace(/\.[0-9a-z_-]+$/, '');

    await fs.ensureDir(dir);
    let frag = new Fragment(dir);

    await frag.writeInformation(info);

    if (info.content) {                            // file with content
      if (file) {
        let ext = paths.extname(file);
        let pfile = paths.join(dir, 'preview'+ext);

        await fs.move(file, pfile);

        await this._make_thumbnail(pfile);
      }
      let metadata = {};
      let summary = await this._make_summary(info.content);

      await frag.storeContent(metadata, info.content, summary);

    }
    else if (file) {                               // regular file
      let ext = paths.extname(file);
      let tfile = paths.join(dir, name+ext);

      await fs.move(file, tfile);

      await this._transform(frag, tfile);
      await this._generate(frag, tfile);
    }
    else if (info.comments) {                      // just a comment
      let ifile = paths.join(dir, 'info.md');
      await this._generate(frag, ifile);
    }


    return frag.fragmentPath();
  }
}

module.exports = Repository;
