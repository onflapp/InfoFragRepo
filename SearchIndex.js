const fs = require('fs-extra');
const paths = require('node:path');
const sqlite = require('node:sqlite');
const Fragment = require('./Fragment');

class SearchIndex {
  constructor(filePath) {
    this.filePath = filePath;

    fs.mkdirSync(filePath, { recursive: true });
    this.database = new sqlite.DatabaseSync(this.filePath+'/index.db');
    this._prepare();
  }

  _fileToFragmentPath(path) {
    return path.substr(this.filePath.length-1);
  }

  _prepare() {
    let sql = '';
    sql += 'CREATE VIRTUAL TABLE IF NOT EXISTS TextIndex USING fts5(toi UNINDEXED, path UNINDEXED, timestamp, bucket, body)';

    this.database.exec(sql);

    this.selectSQL = this.database.prepare('SELECT toi FROM TextIndex WHERE path = ?');
    this.updateSQL = this.database.prepare('UPDATE TextIndex SET toi = ?, timestamp = ?, bucket = ?, body = ? WHERE path = ?');
    this.insertSQL = this.database.prepare('INSERT INTO TextIndex (toi, timestamp, path, bucket, body) VALUES(?, ?, ?, ?, ?)');
    this.querySQL  = this.database.prepare('SELECT path, timestamp FROM TextIndex WHERE body MATCH ?');
    this.querySQL2 = this.database.prepare('SELECT path, timestamp FROM TextIndex WHERE bucket = ? AND body MATCH ?');
    this.querySQL3 = this.database.prepare('SELECT path, timestamp FROM TextIndex WHERE bucket = ?');
    this.allSQL    = this.database.prepare('SELECT path, timestamp FROM TextIndex');
    this.groupsSQL = this.database.prepare('SELECT DISTINCT bucket FROM TextIndex');
  }

  _queryWords(query) {
    let list = query.split(/\W/);
    let words = [];
    
    for (let i = 0; i < list.length; i++) {
      let it = list[i];
      if (it != '') words.push(it);
    }

    return words;
  }

  _makeHeader(info) {
    let rv = [];

    if (info.title)    rv.push(info.title);
    if (info.comments) rv.push(info.comments);
    if (info.resource) rv.push(unescape(info.resource));

    return rv.join('\n');
  }

  async _extractInfo(path, query) {
    const tools = require('./TextTools');

    let frag = new Fragment(path);
    if (!frag.isReadable()) return null;

    let info = await frag.readInformation();
    info.path = this._fileToFragmentPath(path);

    if (query) {
      let body = await frag.readContent();
      info.matches = tools.extract_context(this._makeHeader(info), query);

      if (body) {
        info.matches = info.matches.concat(tools.extract_context(body, query));
      }
    }
      
    return info;
  }

  close() {
    this.database.close();
  }

  async indexPath(path) {
    const removeMd = require('remove-markdown');

    let frag = new Fragment(path);
    let toi = await frag.mdate();

    let fpath = frag.fragmentPath();
    let rv = this.selectSQL.get(fpath);

    if (rv) {
      if (rv.toi != toi) {
        console.log('U:'+fpath);
        let info = await frag.readInformation();
        let content = await frag.readContent();
        let group = (info.group || 'default');
        let timestamp = info.timestamp ? info.timestamp.getTime() : toi;

        let body = this._makeHeader(info) + '\n' + removeMd(content);

        this.updateSQL.run(''+toi, timestamp, group, body, fpath);
      }
    }
    else {
      console.log('I:'+fpath);
      let info = await frag.readInformation();
      let content = await frag.readContent();
      let group = (info.group || 'default');
      let timestamp = info.timestamp ? info.timestamp.getTime() : toi;

      let body = this._makeHeader(info) + '\n' + removeMd(content);

      this.insertSQL.run(''+toi, timestamp, fpath, group, body);
    }
  }

  async listGroups() {
    return new Promise((done, error) => {
      let results = [];
      let rv = this.groupsSQL.all();
      for (let i = 0; i < rv.length; i++) {
        let row = rv[i];
        results.push({
          name:row.bucket
        });
      }
      done(results);
    });
  }

  async listGroup(group, filter) {
    let f = filter || {};
    f.group = group;
    return this.searchText(null, f);
  }

  async listAll(filter) {
    return this.searchText(null, filter);
  }

  async searchText(query, filter) {
    return new Promise((done, error) => {
      let results = [];
      let rv = [];

      if (filter && Object.keys(filter).length > 0) {
        if (filter.group && !filter.start && !filter.end) {
          if (query) {
            rv = this.querySQL2.all(filter.group, query);
          }
          else {
            rv = this.querySQL3.all(filter.group);
          }
        }
        else {
          const sql_esc = require('sqlstring-sqlite').escape;

          let sql = [];
          if (filter.group) sql.push('bucket = '+sql_esc(filter.group));
          if (filter.start) sql.push('timestamp >= '+filter.start);
          if (filter.end)   sql.push('timestamp <= '+filter.end);
          if (query)        sql.push('body MATCH '+sql_esc(query));

          let sv = 'SELECT path, timestamp FROM TextIndex WHERE ' + sql.join(' AND ');
          console.log(sv);
          let st = this.database.prepare(sv);
          rv = st.all();
        }
      }
      else if (query) {
        rv = this.querySQL.all(query);
      }
      else {
        rv = this.allSQL.all();
      }

      if (rv.length == 0) done([]);

      let rn = 0;
      for (let i = 0; i < rv.length; i++) {
        let row = rv[i];

        this._extractInfo(row.path, query).then((info) => {
          if (info) results.push(info);

          rn++;
          if (rn == rv.length) done(results);
        });
      }
    });
  }
}

module.exports = SearchIndex;
