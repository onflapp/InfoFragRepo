const matter = require('gray-matter');
const fs = require('fs-extra');
const paths = require('node:path');

class Fragment {
  constructor(filePath) {
    this.readable = false;
    this.filePath = filePath;
    try {
      if (!fs.lstatSync(this.filePath).isDirectory()) {
        this.filePath = paths.dirname(this.filePath);
      }
      this.readable = true;
    }
    catch(ex) {
    }
  }

  _fragmentToFilePath(path) {
    return paths.join(this.filePath, path);
  }

  _parseDate(ds) {
    let dt = new Date(ds);
    if (dt && !isNaN(dt)) return dt;

    if (ds.indexOf('.000Z') > 0) {
      dt = new Date(ds.substr(0, ds.length-5));
      if (dt && !isNaN(dt)) return dt;
    }

    return null;
  }

  _makeResourceURL(val) {
    if (val.indexOf('://') > 0) return val;
    else {
      let base = paths.resolve(this.filePath);
      return 'file://' + base + '/' + val;
    }
  }

  isReadable() {
    return this.readable;
  }

  fragmentPath() {
    return this.filePath;
  }

  async _findFile(name) {
    let path = this._fragmentToFilePath(name);
    path = paths.resolve(path);
    try {
      await fs.access(path, fs.constants.R_OK);
      return name;
    } 
    catch (ex) {
      return null;
    }
  }

  async mdate() {
    let ipath = this._fragmentToFilePath('info.md');

    return new Promise((done, error) => {
      let stat = fs.statSync(ipath);
      let toi = stat.mtimeMs;

      done(toi);
    });
  }

  async readContent() {
    try {
      let cpath = this._fragmentToFilePath('content.md');
      let data = await fs.readFile(cpath, 'utf8');

      let minfo = matter(data);
      return minfo.content;
    }
    catch(ex) {
      return '';
    }
  }

  async readContentMetadata() {
    try {
      let cpath = this._fragmentToFilePath('content.md');
      let data = await fs.readFile(cpath, 'utf8');

      let minfo = matter(data);
      return minfo.data;
    }
    catch(ex) {
      return {};
    }
  }

  async storeContent(info, content) {
    let cpath = this._fragmentToFilePath('content.md');
    let spath = this._fragmentToFilePath('summary.md');
    let data = matter.stringify(content, info);

    await fs.writeFile(cpath, data);
  }

  async readInformation() {
    let ipath = this._fragmentToFilePath('info.md');
    let data = await fs.readFile(ipath, 'utf8');

    let minfo = matter(data);
    let rec = minfo.data;

    if (typeof rec.timestamp == 'string') rec.timestamp = this._parseDate(rec.timestamp);
    if (minfo.content) rec.comments = minfo.content.trim();

    if (rec.resource) {
      rec.resourceURL = this._makeResourceURL(rec.resource);
    }

    let thumbnail = await this._findFile('thumbnail.png');
    let preview = await this._findFile('preview.pdf');

    if (!preview) preview = await this._findFile('preview.png');

    if (thumbnail) rec.thumbnail = thumbnail;
    if (preview) rec.preview = preview;

    rec.path = this.filePath;
    return rec;
  }

  async writeInformation(info) {
    let rec = {
      type: info.type
    };

    if (info.title)     rec.title = info.title;
    if (info.desc)      rec.description = info.desc;
    if (info.resource)  rec.resource = info.resource;
    if (info.tags)      rec.tags = info.tags;
    if (info.group)     rec.group = info.group;
    if (info.timestamp) rec.timestamp = info.timestamp;

    let data = matter.stringify(info.comments || '', rec);
    let ipath = this._fragmentToFilePath('info.md');

    await fs.writeFile(ipath, data);
  }
}

module.exports = Fragment;
