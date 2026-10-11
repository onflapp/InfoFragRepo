const fs = require('fs-extra');
const paths = require('node:path');
const Fragment = require('./Fragment');
const Transformer = require('./Transformer');

class Repository {
  constructor(filePath) {
    this.filePath = filePath;
    this.mdRegistry = fs.readJsonSync('./files2md.json');
    this.previewRegistry = fs.readJsonSync('./files2preview.json');
  }

  _fragmentToFilePath(path) {
    return paths.join(this.filePath, path);
  }

  _makeName(group) {
    let t = Date.now();
    let n = t + '-' + Math.round(Math.random() * 1E9);

    if (group) return group+'/'+n;
    else return n;
  }

  async _generate(input) {
    const trans = new Transformer(this.previewRegistry);

    return new Promise((done, error) => {
      trans.transformInput(input).then((rv) => {
        let dir = paths.dirname(input);

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

  async _transform(input) {
    const trans = new Transformer(this.mdRegistry);

    return new Promise((done, error) => {
      trans.transformInput(input).then((rv) => {
        let dir = paths.dirname(input);

        if (rv) {
          let frag = new Fragment(dir);
          frag.storeContent(rv.metadata, rv.content).then(() => {
            done(dir);
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

  async createFragment(info, path) {
    let dir = paths.join(this.filePath, this._makeName(info.group));
    let title = info.title;

    await fs.ensureDir(dir);

    if (path) {
      let ext = paths.extname(path);
      let tfile = paths.join(dir, title+ext);

      await fs.move(path, tfile);
      await this._transform(tfile);
      await this._generate(tfile);
    }
console.log(info);
    let frag = new Fragment(dir);
    await frag.writeInformation(info);

    return dir;
  }
}

module.exports = Repository;
